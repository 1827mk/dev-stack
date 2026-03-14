/**
 * Audit Logger - Dev-Stack v6
 * JSONL append-only audit logging with entry validation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  AuditEntry,
  AuditFilter,
  AuditSessionSummary,
  AuditQueryResult,
  AuditExportOptions,
  GuardType
} from './types';

/**
 * Audit Logger Configuration
 */
export interface AuditLoggerConfig {
  enabled: boolean;
  log_path: string;
  max_file_size_mb: number;
  retention_days: number;
  flush_interval_ms: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AuditLoggerConfig = {
  enabled: true,
  log_path: '.dev-stack/logs/audit.jsonl',
  max_file_size_mb: 100,
  retention_days: 30,
  flush_interval_ms: 1000
};

/**
 * Audit Logger class
 * Provides append-only JSONL logging with validation
 */
export class AuditLogger {
  private config: AuditLoggerConfig;
  private writeStream: fs.WriteStream | null = null;
  private sequenceNumber: number = 0;
  private sessionId: string;
  private buffer: AuditEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;
  private shutdownHandlersAttached: boolean = false;

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = crypto.randomUUID();
    this.attachShutdownHandlers();
  }

  /**
   * Attach process shutdown handlers to ensure cleanup
   */
  private attachShutdownHandlers(): void {
    if (this.shutdownHandlersAttached) return;

    // Handle normal exit
    process.on('beforeExit', () => this.gracefulShutdown());

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      this.gracefulShutdown();
      process.exit(0);
    });

    // Handle SIGTERM (kill command)
    process.on('SIGTERM', () => {
      this.gracefulShutdown();
      process.exit(0);
    });

    this.shutdownHandlersAttached = true;
  }

  /**
   * Graceful shutdown - flush buffer and cleanup resources
   */
  private async gracefulShutdown(): Promise<void> {
    try {
      await this.close();
    } catch {
      // Silently fail during shutdown
    }
  }

  /**
   * Initialize the audit logger
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure directory exists
    const logDir = path.dirname(this.config.log_path);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create write stream in append mode
    this.writeStream = fs.createWriteStream(this.config.log_path, {
      flags: 'a',
      encoding: 'utf8'
    });

    // Start flush timer
    if (this.config.flush_interval_ms > 0) {
      this.flushTimer = setInterval(() => this.flush(), this.config.flush_interval_ms);
    }

    // Get next sequence number from existing log
    this.sequenceNumber = await this.getNextSequenceNumber();

    this.initialized = true;
  }

  /**
   * Log an audit entry
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'sequence_number' | 'session_id'>): Promise<AuditEntry> {
    if (!this.config.enabled) {
      return this.createPlaceholderEntry(entry);
    }

    if (!this.initialized) {
      await this.initialize();
    }

    const fullEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sequence_number: ++this.sequenceNumber,
      session_id: this.sessionId
    };

    // Validate entry
    this.validateEntry(fullEntry);

    // Add to buffer
    this.buffer.push(fullEntry);

    // Flush if buffer is large
    if (this.buffer.length >= 100) {
      await this.flush();
    }

    return fullEntry;
  }

  /**
   * Log a successful action
   */
  async logSuccess(
    tool: string,
    action: string,
    target: string,
    options?: Partial<Omit<AuditEntry, 'id' | 'timestamp' | 'sequence_number' | 'session_id'>>
  ): Promise<AuditEntry> {
    return this.log({
      tool,
      action,
      target,
      result: 'success',
      rollback_available: options?.rollback_available ?? false,
      ...options
    });
  }

  /**
   * Log a blocked action
   */
  async logBlocked(
    tool: string,
    action: string,
    target: string,
    guard: GuardType,
    reason: string,
    options?: Partial<Omit<AuditEntry, 'id' | 'timestamp' | 'sequence_number' | 'session_id'>>
  ): Promise<AuditEntry> {
    return this.log({
      tool,
      action,
      target,
      result: 'blocked',
      guard,
      reason,
      rollback_available: false,
      ...options
    });
  }

  /**
   * Log an error
   */
  async logError(
    tool: string,
    action: string,
    target: string,
    errorMessage: string,
    options?: Partial<Omit<AuditEntry, 'id' | 'timestamp' | 'sequence_number' | 'session_id'>>
  ): Promise<AuditEntry> {
    return this.log({
      tool,
      action,
      target,
      result: 'error',
      error_message: errorMessage,
      rollback_available: false,
      ...options
    });
  }

  /**
   * Flush buffer to disk
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.writeStream) return;

    const lines = this.buffer.map(entry => JSON.stringify(entry));
    const content = lines.join('\n') + '\n';

    return new Promise((resolve, reject) => {
      this.writeStream!.write(content, (error) => {
        if (error) {
          reject(error);
        } else {
          this.buffer = [];
          resolve();
        }
      });
    });
  }

  /**
   * Query audit entries
   */
  async query(filter: AuditFilter = {}): Promise<AuditQueryResult> {
    await this.flush(); // Ensure all entries are written

    const entries = await this.readEntries(filter);
    const totalCount = entries.length;
    const limit = filter.limit ?? 100;
    const offset = filter.offset ?? 0;

    const paginatedEntries = entries.slice(offset, offset + limit);

    return {
      entries: paginatedEntries,
      total_count: totalCount,
      has_more: offset + limit < totalCount
    };
  }

  /**
   * Get session summary
   */
  async getSessionSummary(sessionId?: string): Promise<AuditSessionSummary> {
    const targetSessionId = sessionId ?? this.sessionId;
    const entries = await this.readEntries({ session_id: targetSessionId });

    if (entries.length === 0) {
      return {
        session_id: targetSessionId,
        started_at: new Date().toISOString(),
        total_actions: 0,
        successful_actions: 0,
        blocked_actions: 0,
        error_actions: 0,
        scope_blocks: 0,
        secret_blocks: 0,
        bash_blocks: 0,
        files_created: 0,
        files_modified: 0,
        files_deleted: 0,
        total_duration_ms: 0,
        total_tokens_used: 0,
        patterns_used: 0,
        patterns_learned: 0,
        success_rate: 0
      };
    }

    const summary: AuditSessionSummary = {
      session_id: targetSessionId,
      started_at: entries[0].timestamp,
      ended_at: entries[entries.length - 1].timestamp,
      total_actions: entries.length,
      successful_actions: entries.filter(e => e.result === 'success').length,
      blocked_actions: entries.filter(e => e.result === 'blocked').length,
      error_actions: entries.filter(e => e.result === 'error').length,
      scope_blocks: entries.filter(e => e.guard === 'scope').length,
      secret_blocks: entries.filter(e => e.guard === 'secret').length,
      bash_blocks: entries.filter(e => e.guard === 'bash').length,
      files_created: entries.filter(e => e.action === 'write_file' && e.result === 'success').length,
      files_modified: entries.filter(e => e.action === 'edit_file' && e.result === 'success').length,
      files_deleted: entries.filter(e => e.action === 'delete_file' && e.result === 'success').length,
      total_duration_ms: entries.reduce((sum, e) => sum + (e.duration_ms ?? 0), 0),
      total_tokens_used: entries.reduce((sum, e) => sum + (e.tokens_used ?? 0), 0),
      patterns_used: 0, // Would need pattern tracking
      patterns_learned: 0,
      success_rate: 0
    };

    summary.success_rate = summary.total_actions > 0
      ? summary.successful_actions / summary.total_actions
      : 0;

    return summary;
  }

  /**
   * Export audit log
   */
  async export(options: AuditExportOptions): Promise<string> {
    await this.flush();

    const entries = await this.readEntries(options.filters ?? {});

    switch (options.format) {
      case 'jsonl':
        return entries.map(e => JSON.stringify(e)).join('\n');
      case 'json':
        return JSON.stringify(
          options.pretty_print ? entries : entries,
          null,
          options.pretty_print ? 2 : 0
        );
      case 'csv':
        return this.entriesToCSV(entries);
      case 'markdown':
        return this.entriesToMarkdown(entries, options.include_statistics);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Close the logger
   */
  async close(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();

    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve());
      });
      this.writeStream = null;
    }

    this.initialized = false;
  }

  /**
   * Get next sequence number from existing log
   */
  private async getNextSequenceNumber(): Promise<number> {
    if (!fs.existsSync(this.config.log_path)) {
      return 0;
    }

    const content = fs.readFileSync(this.config.log_path, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);

    if (lines.length === 0) {
      return 0;
    }

    try {
      const lastEntry = JSON.parse(lines[lines.length - 1]);
      return lastEntry.sequence_number ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Read entries from log file
   */
  private async readEntries(filter: AuditFilter): Promise<AuditEntry[]> {
    if (!fs.existsSync(this.config.log_path)) {
      return [];
    }

    const content = fs.readFileSync(this.config.log_path, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);

    let entries: AuditEntry[] = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter((e): e is AuditEntry => e !== null);

    // Apply filters
    if (filter.session_id) {
      entries = entries.filter(e => e.session_id === filter.session_id);
    }
    if (filter.start_time) {
      entries = entries.filter(e => e.timestamp >= filter.start_time!);
    }
    if (filter.end_time) {
      entries = entries.filter(e => e.timestamp <= filter.end_time!);
    }
    if (filter.tool) {
      entries = entries.filter(e => e.tool === filter.tool);
    }
    if (filter.action) {
      entries = entries.filter(e => e.action === filter.action);
    }
    if (filter.result) {
      entries = entries.filter(e => e.result === filter.result);
    }
    if (filter.guard) {
      entries = entries.filter(e => e.guard === filter.guard);
    }
    if (filter.target_pattern) {
      const pattern = new RegExp(filter.target_pattern, 'i');
      entries = entries.filter(e => pattern.test(e.target));
    }

    // Sort by timestamp descending
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return entries;
  }

  /**
   * Validate audit entry
   */
  private validateEntry(entry: AuditEntry): void {
    if (!entry.id) throw new Error('Audit entry must have id');
    if (!entry.timestamp) throw new Error('Audit entry must have timestamp');
    if (!entry.tool) throw new Error('Audit entry must have tool');
    if (!entry.action) throw new Error('Audit entry must have action');
    if (!entry.target) throw new Error('Audit entry must have target');
    if (!['success', 'blocked', 'error', 'skipped'].includes(entry.result)) {
      throw new Error(`Invalid result: ${entry.result}`);
    }
  }

  /**
   * Create placeholder entry when logging disabled
   */
  private createPlaceholderEntry(
    entry: Omit<AuditEntry, 'id' | 'timestamp' | 'sequence_number' | 'session_id'>
  ): AuditEntry {
    return {
      ...entry,
      id: 'disabled',
      timestamp: new Date().toISOString(),
      sequence_number: 0,
      session_id: this.sessionId
    };
  }

  /**
   * Convert entries to CSV
   */
  private entriesToCSV(entries: AuditEntry[]): string {
    const headers = [
      'id', 'timestamp', 'session_id', 'tool', 'action', 'target',
      'result', 'reason', 'guard', 'duration_ms', 'tokens_used'
    ];

    const rows = entries.map(e => headers.map(h => {
      const value = e[h as keyof AuditEntry];
      if (value === undefined || value === null) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert entries to Markdown
   */
  private entriesToMarkdown(entries: AuditEntry[], includeStats?: boolean): string {
    let md = '# Audit Log\n\n';

    if (includeStats) {
      md += `**Total Entries**: ${entries.length}\n\n`;
    }

    md += '| Timestamp | Tool | Action | Target | Result | Guard |\n';
    md += '|-----------|------|--------|--------|--------|-------|\n';

    for (const entry of entries.slice(0, 100)) { // Limit for markdown
      md += `| ${entry.timestamp} | ${entry.tool} | ${entry.action} | ${entry.target} | ${entry.result} | ${entry.guard ?? '-'} |\n`;
    }

    return md;
  }
}

/**
 * Export singleton instance
 */
export const auditLogger = new AuditLogger();
