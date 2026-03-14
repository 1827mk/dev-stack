/**
 * Tool Availability Checker - Dev-Stack v6
 * Checks if tools are available at runtime
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Tool source type
 */
export type ToolSource = 'mcp' | 'plugin' | 'builtin' | 'skill';

/**
 * Tool info
 */
export interface ToolInfo {
  name: string;
  source: ToolSource;
  server?: string; // For MCP tools
  plugin?: string; // For plugin tools
  available: boolean;
  last_checked?: string;
}

/**
 * MCP server info
 */
export interface MCPServerInfo {
  name: string;
  status: 'running' | 'stopped' | 'error';
  tools: string[];
}

/**
 * Tool availability checker class
 */
export class ToolAvailabilityChecker {
  private availableTools: Map<string, ToolInfo> = new Map();
  private mcpServers: Map<string, MCPServerInfo> = new Map();
  private lastRefresh: string | null = null;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Refresh tool availability from all sources
   */
  async refresh(): Promise<void> {
    this.availableTools.clear();

    // Load builtin tools
    this.loadBuiltinTools();

    // Load MCP tools
    await this.loadMCPTools();

    // Load plugin tools
    this.loadPluginTools();

    // Load skill tools
    this.loadSkillTools();

    this.lastRefresh = new Date().toISOString();
  }

  /**
   * Load builtin Claude Code tools
   */
  private loadBuiltinTools(): void {
    const builtinTools = [
      'Read',
      'Write',
      'Edit',
      'Glob',
      'Grep',
      'Bash',
      'WebSearch',
      'LSP',
      'Agent',
      'AskUserQuestion',
      'TaskCreate',
      'TaskGet',
      'TaskUpdate',
      'TaskList',
      'Skill'
    ];

    for (const tool of builtinTools) {
      this.availableTools.set(tool, {
        name: tool,
        source: 'builtin',
        available: true,
        last_checked: new Date().toISOString()
      });
    }
  }

  /**
   * Load MCP tools from .mcp.json
   */
  private async loadMCPTools(): Promise<void> {
    const mcpConfigPath = path.join(this.projectRoot, '.mcp.json');

    if (!fs.existsSync(mcpConfigPath)) {
      return;
    }

    try {
      const content = fs.readFileSync(mcpConfigPath, 'utf8');
      const config = JSON.parse(content);

      // Process MCP servers
      if (config.mcpServers) {
        for (const serverName of Object.keys(config.mcpServers)) {
          const serverInfo: MCPServerInfo = {
            name: serverName,
            status: 'running', // Assume running if configured
            tools: []
          };

          // Extract tools from server config
          // This is a simplified version - actual implementation would query the server
          if (serverName === 'serena') {
            serverInfo.tools = [
              'serena:activate_project',
              'serena:check_onboarding_performed',
              'serena:onboarding',
              'serena:initial_instructions',
              'serena:find_symbol',
              'serena:find_referencing_symbols',
              'serena:get_symbols_overview',
              'serena:search_for_pattern',
              'serena:find_file',
              'serena:replace_symbol_body',
              'serena:insert_after_symbol',
              'serena:insert_before_symbol',
              'serena:rename_symbol'
            ];
          } else if (serverName === 'filesystem') {
            serverInfo.tools = [
              'mcp__filesystem__read_text_file',
              'mcp__filesystem__write_file',
              'mcp__filesystem__list_directory',
              'mcp__filesystem__directory_tree',
              'mcp__filesystem__search_files'
            ];
          } else if (serverName === 'memory') {
            serverInfo.tools = [
              'mcp__memory__create_entities',
              'mcp__memory__create_relations',
              'mcp__memory__search_nodes',
              'mcp__memory__read_graph'
            ];
          } else if (serverName === 'sequentialthinking') {
            serverInfo.tools = [
              'mcp__sequentialthinking__sequentialthinking'
            ];
          }

          this.mcpServers.set(serverName, serverInfo);

          // Add tools to available tools
          for (const tool of serverInfo.tools) {
            this.availableTools.set(tool, {
              name: tool,
              source: 'mcp',
              server: serverName,
              available: true,
              last_checked: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load MCP config:', error);
    }
  }

  /**
   * Load plugin tools
   */
  private loadPluginTools(): void {
    const pluginDir = path.join(this.projectRoot, '.claude-plugin');

    if (!fs.existsSync(pluginDir)) {
      return;
    }

    // Check for skills directory
    const skillsDir = path.join(pluginDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));
      for (const file of skillFiles) {
        const skillName = file.replace('.md', '');
        const toolName = `skill:${skillName}`;
        this.availableTools.set(toolName, {
          name: toolName,
          source: 'skill',
          plugin: 'dev-stack',
          available: true,
          last_checked: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Load skill tools
   */
  private loadSkillTools(): void {
    // Skills are already loaded in loadPluginTools
    // This is for any additional skill sources
  }

  /**
   * Check if a tool is available
   */
  isAvailable(toolName: string): boolean {
    // Check exact match
    if (this.availableTools.has(toolName)) {
      return this.availableTools.get(toolName)!.available;
    }

    // Check pattern match
    if (toolName.includes(':*')) {
      const prefix = toolName.replace('*', '');
      for (const [name, info] of this.availableTools) {
        if (name.startsWith(prefix) && info.available) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get tool info
   */
  getToolInfo(toolName: string): ToolInfo | undefined {
    return this.availableTools.get(toolName);
  }

  /**
   * Get all available tools
   */
  getAvailableTools(): ToolInfo[] {
    return Array.from(this.availableTools.values()).filter(t => t.available);
  }

  /**
   * Get tools by source
   */
  getToolsBySource(source: ToolSource): ToolInfo[] {
    return this.getAvailableTools().filter(t => t.source === source);
  }

  /**
   * Get MCP server info
   */
  getMCPServerInfo(serverName: string): MCPServerInfo | undefined {
    return this.mcpServers.get(serverName);
  }

  /**
   * Get all MCP servers
   */
  getAllMCPServers(): MCPServerInfo[] {
    return Array.from(this.mcpServers.values());
  }

  /**
   * Check MCP server status
   */
  async checkMCPServerStatus(serverName: string): Promise<'running' | 'stopped' | 'error'> {
    // In a real implementation, this would ping the server
    const server = this.mcpServers.get(serverName);
    return server?.status ?? 'stopped';
  }

  /**
   * Get tool availability summary
   */
  getSummary(): {
    total_tools: number;
    available_tools: number;
    by_source: Record<ToolSource, number>;
    mcp_servers: number;
    last_refresh: string | null;
  } {
    const tools = this.getAvailableTools();
    const bySource: Record<ToolSource, number> = {
      builtin: 0,
      mcp: 0,
      plugin: 0,
      skill: 0
    };

    for (const tool of tools) {
      bySource[tool.source]++;
    }

    return {
      total_tools: this.availableTools.size,
      available_tools: tools.length,
      by_source: bySource,
      mcp_servers: this.mcpServers.size,
      last_refresh: this.lastRefresh
    };
  }

  /**
   * Find tools matching a pattern
   */
  findTools(pattern: string): ToolInfo[] {
    const regex = new RegExp(pattern, 'i');
    return this.getAvailableTools().filter(t => regex.test(t.name));
  }

  /**
   * Get tool suggestions for a capability
   */
  suggestToolsForCapability(capability: string): ToolInfo[] {
    // Map capabilities to likely tools
    const capabilityMappings: Record<string, string[]> = {
      'code.scan': ['serena:onboarding', 'mcp__filesystem__directory_tree'],
      'code.find_symbol': ['serena:find_symbol', 'Grep'],
      'code.edit': ['serena:replace_symbol_body', 'Edit'],
      'file.read': ['Read', 'mcp__filesystem__read_text_file'],
      'file.write': ['Write', 'mcp__filesystem__write_file'],
      'exec.bash': ['Bash']
    };

    const suggestedTools = capabilityMappings[capability] ?? [];
    return suggestedTools
      .map(t => this.availableTools.get(t))
      .filter((t): t is ToolInfo => t !== undefined && t.available);
  }
}

/**
 * Export singleton instance
 */
export const toolChecker = new ToolAvailabilityChecker();
