/**
 * Capability Loader - Dev-Stack v6
 * Loads and validates capability registry from YAML configuration
 */

import * as fs from 'fs';
import * as yaml from 'js-yaml';

/**
 * Capability definition
 */
export interface Capability {
  primary: string;
  fallback: string | null;
  description: string;
  timeout_s: number;
  requires_guard: boolean;
}

/**
 * Capability registry
 */
export interface CapabilityRegistry {
  version: string;
  capabilities: Record<string, Capability>;
}

/**
 * Loaded capability with metadata
 */
export interface LoadedCapability extends Capability {
  name: string;
  available: boolean;
  primary_available: boolean;
  fallback_available: boolean;
}

/**
 * Capability loader class
 */
export class CapabilityLoader {
  private registry: CapabilityRegistry | null = null;
  private loadedCapabilities: Map<string, LoadedCapability> = new Map();
  private availableTools: Set<string>;

  constructor(availableTools: string[] = []) {
    this.availableTools = new Set(availableTools);
  }

  /**
   * Load capability registry from file
   */
  loadFromYaml(filePath: string): CapabilityRegistry {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Capability registry not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(content) as CapabilityRegistry;

    this.registry = parsed;
    this.processRegistry();

    return parsed;
  }

  /**
   * Load from JSON object
   */
  loadFromObject(config: CapabilityRegistry): void {
    this.registry = config;
    this.processRegistry();
  }

  /**
   * Process loaded registry
   */
  private processRegistry(): void {
    if (!this.registry) return;

    this.loadedCapabilities.clear();

    for (const [name, cap] of Object.entries(this.registry.capabilities)) {
      const loaded: LoadedCapability = {
        name,
        ...cap,
        available: this.checkAvailability(cap.primary) ||
                   (cap.fallback !== 'none' && cap.fallback !== null && this.checkAvailability(cap.fallback)),
        primary_available: this.checkAvailability(cap.primary),
        fallback_available: cap.fallback !== 'none' && cap.fallback !== null &&
                           this.checkAvailability(cap.fallback)
      };

      this.loadedCapabilities.set(name, loaded);
    }
  }

  /**
   * Check if a tool is available
   */
  private checkAvailability(toolName: string): boolean {
    // Check exact match
    if (this.availableTools.has(toolName)) {
      return true;
    }

    // Check pattern match (e.g., "serena:*" matches any serena tool)
    for (const available of this.availableTools) {
      if (toolName.endsWith(':*')) {
        const prefix = toolName.slice(0, -1);
        if (available.startsWith(prefix)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Set available tools
   */
  setAvailableTools(tools: string[]): void {
    this.availableTools = new Set(tools);
    this.processRegistry();
  }

  /**
   * Get a capability by name
   */
  getCapability(name: string): LoadedCapability | undefined {
    return this.loadedCapabilities.get(name);
  }

  /**
   * Get the best available tool for a capability
   */
  getToolForCapability(name: string): string | null {
    const cap = this.loadedCapabilities.get(name);
    if (!cap) return null;

    if (cap.primary_available) {
      return cap.primary;
    }

    if (cap.fallback_available && cap.fallback && cap.fallback !== 'none') {
      return cap.fallback;
    }

    return null;
  }

  /**
   * Check if a capability is available
   */
  isCapabilityAvailable(name: string): boolean {
    const cap = this.loadedCapabilities.get(name);
    return cap?.available ?? false;
  }

  /**
   * Get all capabilities
   */
  getAllCapabilities(): LoadedCapability[] {
    return Array.from(this.loadedCapabilities.values());
  }

  /**
   * Get available capabilities
   */
  getAvailableCapabilities(): LoadedCapability[] {
    return this.getAllCapabilities().filter(c => c.available);
  }

  /**
   * Get unavailable capabilities
   */
  getUnavailableCapabilities(): LoadedCapability[] {
    return this.getAllCapabilities().filter(c => !c.available);
  }

  /**
   * Search capabilities by description
   */
  searchCapabilities(query: string): LoadedCapability[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllCapabilities().filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get capabilities by category
   */
  getCapabilitiesByCategory(category: string): LoadedCapability[] {
    return this.getAllCapabilities().filter(c =>
      c.name.startsWith(`${category}.`)
    );
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    total: number;
    available: number;
    unavailable: number;
    by_category: Record<string, number>;
  } {
    const all = this.getAllCapabilities();
    const byCategory: Record<string, number> = {};

    for (const cap of all) {
      const parts = cap.name.split('.');
      const category = parts[0] ?? 'unknown';
      byCategory[category] = (byCategory[category] ?? 0) + 1;
    }

    return {
      total: all.length,
      available: all.filter(c => c.available).length,
      unavailable: all.filter(c => !c.available).length,
      by_category: byCategory
    };
  }
}

/**
 * Export singleton instance
 */
export const capabilityLoader = new CapabilityLoader();
