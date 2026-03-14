/**
 * DNA Scanner - Dev-Stack v6
 * Scans project and extracts Project DNA
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ProjectDNA,
  ProjectType,
  TechStack,
  EntryPoint,
  KeyDirectory,
  CodingStyle,
  NamingConvention,
  FormatterType,
  ProtectedPath,
  HighCouplingArea,
  RiskArea,
  ScanOptions,
  ComponentPattern
} from './types.js';

/**
 * Default scan options
 */
export const DEFAULT_SCAN_OPTIONS: ScanOptions = {
  deep: false,
  force: false,
  include_patterns: ['**/*'],
  exclude_patterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/.dev-stack/**'
  ],
  max_files: 1000
};

/**
 * File extension to language mapping
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.swift': 'Swift',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.cs': 'C#',
  '.cpp': 'C++',
  '.c': 'C',
  '.vue': 'Vue',
  '.svelte': 'Svelte'
};

/**
 * Framework detection patterns
 */
const FRAMEWORK_PATTERNS: Record<string, { files: string[]; deps: string[] }> = {
  'Next.js': {
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    deps: ['next']
  },
  'React': {
    files: [],
    deps: ['react', 'react-dom']
  },
  'Vue': {
    files: ['vue.config.js', 'vite.config.js'],
    deps: ['vue']
  },
  'Angular': {
    files: ['angular.json'],
    deps: ['@angular/core']
  },
  'Svelte': {
    files: ['svelte.config.js'],
    deps: ['svelte']
  },
  'Express': {
    files: [],
    deps: ['express']
  },
  'FastAPI': {
    files: [],
    deps: ['fastapi']
  },
  'Django': {
    files: ['manage.py'],
    deps: ['django']
  },
  'Flask': {
    files: [],
    deps: ['flask']
  }
};

/**
 * DNA Scanner class
 */
export class DNAScanner {
  private projectRoot: string;
  private options: ScanOptions;
  private scannedFiles: string[] = [];
  private fileContents: Map<string, string> = new Map();

  constructor(projectRoot: string, options: Partial<ScanOptions> = {}) {
    this.projectRoot = projectRoot;
    this.options = { ...DEFAULT_SCAN_OPTIONS, ...options };
  }

  /**
   * Scan project and generate DNA
   */
  async scan(): Promise<ProjectDNA> {
    const startTime = Date.now();

    // Scan files
    await this.scanFiles();

    // Build DNA
    const dna: ProjectDNA = {
      id: uuidv4(),
      name: this.getProjectName(),
      type: this.detectProjectType(),
      primary_language: this.detectPrimaryLanguage(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: '1.0.0',

      tech_stack: this.detectTechStack(),
      entry_points: this.detectEntryPoints(),
      key_directories: this.detectKeyDirectories(),
      architecture_pattern: this.detectArchitecturePattern(),

      coding_style: this.detectCodingStyle(),
      conventions: this.detectConventions(),

      protected_paths: this.detectProtectedPaths(),
      high_coupling: this.detectHighCoupling(),
      risk_areas: this.detectRiskAreas(),

      what_works: [],
      what_not_to_do: [],
      user_preferences: [],

      total_files: this.scannedFiles.length,
      total_lines: this.countTotalLines(),
      last_scan_duration_ms: Date.now() - startTime
    };

    return dna;
  }

  /**
   * Scan project files
   */
  private async scanFiles(): Promise<void> {
    this.scannedFiles = [];
    this.fileContents.clear();

    const scanDir = (dir: string): void => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.shouldExclude(fullPath)) continue;
          scanDir(fullPath);
        } else if (entry.isFile()) {
          // Check include/exclude patterns
          if (this.shouldExclude(fullPath)) continue;
          if (!this.shouldInclude(fullPath)) continue;

          // Limit files
          if (this.scannedFiles.length >= this.options.max_files) return;

          this.scannedFiles.push(fullPath);

          // Read file content for analysis
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            this.fileContents.set(fullPath, content);
          } catch {
            // Skip binary or unreadable files
          }
        }
      }
    };

    scanDir(this.projectRoot);
  }

  /**
   * Check if path should be excluded
   */
  private shouldExclude(fullPath: string): boolean {
    const relativePath = path.relative(this.projectRoot, fullPath);

    for (const pattern of this.options.exclude_patterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if path should be included
   */
  private shouldInclude(fullPath: string): boolean {
    const relativePath = path.relative(this.projectRoot, fullPath);

    for (const pattern of this.options.include_patterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple glob pattern matching
   */
  private matchesPattern(path: string, pattern: string): boolean {
    // Convert glob to regex
    const regex = pattern
      .replace(/\*\*/g, '<<DOUBLESTAR>>')
      .replace(/\*/g, '[^/]*')
      .replace(/<<DOUBLESTAR>>/g, '.*')
      .replace(/\?/g, '[^/]');

    return new RegExp(regex).test(path);
  }

  /**
   * Get project name from package.json or directory
   */
  private getProjectName(): string {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf8');
        const pkg = JSON.parse(content);
        return pkg.name ?? path.basename(this.projectRoot);
      } catch {
        return path.basename(this.projectRoot);
      }
    }

    return path.basename(this.projectRoot);
  }

  /**
   * Detect project type
   */
  private detectProjectType(): ProjectType {
    const hasPackageJson = fs.existsSync(path.join(this.projectRoot, 'package.json'));
    const _hasRequirements = fs.existsSync(path.join(this.projectRoot, 'requirements.txt'));
    const _hasPyproject = fs.existsSync(path.join(this.projectRoot, 'pyproject.toml'));
    const hasCargo = fs.existsSync(path.join(this.projectRoot, 'Cargo.toml'));
    const hasGoMod = fs.existsSync(path.join(this.projectRoot, 'go.mod'));

    // Check for specific project indicators
    if (this.hasDependency('next') || this.hasDependency('nuxt')) {
      return 'web-app';
    }

    if (this.hasDependency('express') || this.hasDependency('fastapi') || this.hasDependency('django')) {
      return 'api';
    }

    if (hasPackageJson && this.hasFile('cli.js', 'bin.js')) {
      return 'cli';
    }

    if (hasCargo || hasGoMod || (hasPackageJson && !this.hasFile('index.html'))) {
      return 'library';
    }

    return 'web-app';
  }

  /**
   * Detect primary language
   */
  private detectPrimaryLanguage(): string {
    const languageCounts: Record<string, number> = {};

    for (const filePath of this.scannedFiles) {
      const ext = path.extname(filePath);
      const language = EXTENSION_TO_LANGUAGE[ext];

      if (language) {
        languageCounts[language] = (languageCounts[language] ?? 0) + 1;
      }
    }

    // Find most common language
    let maxCount = 0;
    let primaryLanguage = 'Unknown';

    for (const [language, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryLanguage = language;
      }
    }

    return primaryLanguage;
  }

  /**
   * Detect tech stack
   */
  private detectTechStack(): TechStack {
    const techStack: TechStack = {
      framework: this.detectFramework(),
      database: this.detectDatabase(),
      testing: this.detectTestingFramework()
    };

    // Add optional fields if detected
    const orm = this.detectORM();
    if (orm) techStack.orm = orm;

    const auth = this.detectAuth();
    if (auth) techStack.auth = auth;

    return techStack;
  }

  /**
   * Detect framework
   */
  private detectFramework(): string {
    const packageJson = this.readPackageJson();
    if (!packageJson?.dependencies) return 'Unknown';

    const deps = Object.keys(packageJson.dependencies);

    for (const [framework, patterns] of Object.entries(FRAMEWORK_PATTERNS)) {
      // Check for framework files
      const hasFiles = patterns.files.some(file =>
        fs.existsSync(path.join(this.projectRoot, file))
      );

      // Check for framework dependencies
      const hasDeps = patterns.deps.some(dep => deps.includes(dep));

      if (hasFiles || hasDeps) {
        return framework;
      }
    }

    return 'Unknown';
  }

  /**
   * Detect database
   */
  private detectDatabase(): string {
    const packageJson = this.readPackageJson();
    const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) } as Record<string, string>;

    if (deps?.['pg'] || deps?.['@types/pg']) return 'PostgreSQL';
    if (deps?.['mysql'] || deps?.['mysql2']) return 'MySQL';
    if (deps?.['mongodb'] || deps?.['mongoose']) return 'MongoDB';
    if (deps?.['better-sqlite3']) return 'SQLite';
    if (deps?.['redis']) return 'Redis';

    // Check Python
    if (this.hasFile('requirements.txt')) {
      const requirements = fs.readFileSync(
        path.join(this.projectRoot, 'requirements.txt'),
        'utf8'
      );
      if (requirements.includes('psycopg')) return 'PostgreSQL';
      if (requirements.includes('pymongo')) return 'MongoDB';
      if (requirements.includes('redis')) return 'Redis';
    }

    return 'Unknown';
  }

  /**
   * Detect testing framework
   */
  private detectTestingFramework(): string {
    const packageJson = this.readPackageJson();
    const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) } as Record<string, string>;

    if (deps?.['vitest']) return 'Vitest';
    if (deps?.['jest']) return 'Jest';
    if (deps?.['mocha']) return 'Mocha';
    if (deps?.['@testing-library/react']) return 'Testing Library';
    if (deps?.['pytest']) return 'pytest';

    return 'Unknown';
  }

  /**
   * Detect ORM
   */
  private detectORM(): string | undefined {
    const packageJson = this.readPackageJson();
    const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) } as Record<string, string>;

    if (deps?.['prisma']) return 'Prisma';
    if (deps?.['@prisma/client']) return 'Prisma';
    if (deps?.['typeorm']) return 'TypeORM';
    if (deps?.['sequelize']) return 'Sequelize';
    if (deps?.['drizzle-orm']) return 'Drizzle';
    if (deps?.['sqlalchemy']) return 'SQLAlchemy';

    return undefined;
  }

  /**
   * Detect auth library
   */
  private detectAuth(): string | undefined {
    const packageJson = this.readPackageJson();
    const deps = { ...(packageJson?.dependencies ?? {}), ...(packageJson?.devDependencies ?? {}) } as Record<string, string>;

    if (deps?.['next-auth']) return 'NextAuth';
    if (deps?.['@auth/core']) return 'Auth.js';
    if (deps?.['passport']) return 'Passport';
    if (deps?.['jose']) return 'JOSE';
    if (deps?.['jsonwebtoken']) return 'jsonwebtoken';

    return undefined;
  }

  /**
   * Detect entry points
   */
  private detectEntryPoints(): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];

    // Common entry point files
    const commonEntryPoints = [
      { path: 'src/index.ts', type: 'main' as const },
      { path: 'src/main.ts', type: 'main' as const },
      { path: 'src/app.ts', type: 'main' as const },
      { path: 'index.ts', type: 'main' as const },
      { path: 'index.js', type: 'main' as const },
      { path: 'src/pages/index.tsx', type: 'route' as const },
      { path: 'src/app/page.tsx', type: 'route' as const },
      { path: 'app/page.tsx', type: 'route' as const },
      { path: 'pages/index.tsx', type: 'route' as const },
      { path: 'src/api/index.ts', type: 'handler' as const },
      { path: 'src/server.ts', type: 'main' as const }
    ];

    for (const ep of commonEntryPoints) {
      if (fs.existsSync(path.join(this.projectRoot, ep.path))) {
        entryPoints.push({
          path: ep.path,
          type: ep.type
        });
      }
    }

    // Limit to 10 entry points
    return entryPoints.slice(0, 10);
  }

  /**
   * Detect key directories
   */
  private detectKeyDirectories(): KeyDirectory[] {
    const keyDirectories: KeyDirectory[] = [];

    // Common important directories
    const commonDirs = [
      { path: 'src', purpose: 'Source code' },
      { path: 'lib', purpose: 'Library code' },
      { path: 'components', purpose: 'UI components' },
      { path: 'pages', purpose: 'Page routes' },
      { path: 'app', purpose: 'App routes' },
      { path: 'api', purpose: 'API handlers' },
      { path: 'tests', purpose: 'Test files' },
      { path: '__tests__', purpose: 'Test files' },
      { path: 'spec', purpose: 'Specifications' },
      { path: 'specs', purpose: 'Specifications' },
      { path: 'docs', purpose: 'Documentation' },
      { path: 'config', purpose: 'Configuration' },
      { path: 'utils', purpose: 'Utility functions' },
      { path: 'hooks', purpose: 'React hooks' },
      { path: 'services', purpose: 'Service layer' },
      { path: 'models', purpose: 'Data models' },
      { path: 'types', purpose: 'Type definitions' }
    ];

    for (const dir of commonDirs) {
      const fullPath = path.join(this.projectRoot, dir.path);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        // Count files
        const files = this.scannedFiles.filter(f =>
          f.startsWith(fullPath)
        );

        keyDirectories.push({
          path: dir.path,
          purpose: dir.purpose,
          file_count: files.length
        });
      }
    }

    return keyDirectories.slice(0, 15);
  }

  /**
   * Detect architecture pattern
   */
  private detectArchitecturePattern(): 'monolith' | 'microservices' | 'serverless' | 'modular' {
    // Check for microservices indicators
    if (fs.existsSync(path.join(this.projectRoot, 'docker-compose.yml'))) {
      return 'microservices';
    }

    // Check for serverless indicators
    if (
      fs.existsSync(path.join(this.projectRoot, 'serverless.yml')) ||
      fs.existsSync(path.join(this.projectRoot, 'sam.yaml')) ||
      this.hasFile('vercel.json', 'netlify.toml')
    ) {
      return 'serverless';
    }

    // Check for modular structure
    const hasPackages = fs.existsSync(path.join(this.projectRoot, 'packages'));
    const hasApps = fs.existsSync(path.join(this.projectRoot, 'apps'));

    if (hasPackages || hasApps) {
      return 'modular';
    }

    return 'monolith';
  }

  /**
   * Detect coding style
   */
  private detectCodingStyle(): CodingStyle {
    return {
      naming: this.detectNamingConvention(),
      formatter: this.detectFormatter(),
      component_pattern: this.detectComponentPattern(),
      indent_size: this.detectIndentSize(),
      max_line_length: this.detectMaxLineLength()
    };
  }

  /**
   * Detect naming convention
   */
  private detectNamingConvention(): NamingConvention {
    // Analyze file names
    let camelCaseCount = 0;
    let snakeCaseCount = 0;
    let pascalCaseCount = 0;
    let kebabCaseCount = 0;

    for (const filePath of this.scannedFiles.slice(0, 100)) {
      const basename = path.basename(filePath, path.extname(filePath));

      if (/^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/.test(basename)) {
        camelCaseCount++;
      } else if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(basename)) {
        snakeCaseCount++;
      } else if (/^[A-Z][a-zA-Z0-9]*$/.test(basename)) {
        pascalCaseCount++;
      } else if (/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(basename)) {
        kebabCaseCount++;
      }
    }

    // Find most common
    const counts = {
      camelCase: camelCaseCount,
      snake_case: snakeCaseCount,
      PascalCase: pascalCaseCount,
      'kebab-case': kebabCaseCount
    };

    let maxConvention: NamingConvention = 'camelCase';
    let maxCount = 0;

    for (const [convention, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxConvention = convention as NamingConvention;
      }
    }

    return maxConvention;
  }

  /**
   * Detect formatter
   */
  private detectFormatter(): FormatterType {
    const hasPrettier = fs.existsSync(path.join(this.projectRoot, '.prettierrc')) ||
                       fs.existsSync(path.join(this.projectRoot, '.prettierrc.json')) ||
                       this.hasDependency('prettier');

    if (hasPrettier) return 'prettier';

    const hasBlack = this.hasFile('pyproject.toml') &&
      fs.readFileSync(path.join(this.projectRoot, 'pyproject.toml'), 'utf8').includes('black');

    if (hasBlack) return 'black';

    return 'none';
  }

  /**
   * Detect component pattern
   */
  private detectComponentPattern(): ComponentPattern {
    // Check for hooks usage
    let hooksCount = 0;
    let classCount = 0;

    for (const [filePath, content] of this.fileContents) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        if (/use[A-Z]\w+/.test(content)) hooksCount++;
        if (/class\s+\w+\s+extends\s+(React\.)?Component/.test(content)) classCount++;
      }
    }

    if (hooksCount > classCount) return 'hooks';
    if (classCount > hooksCount) return 'class-based';

    return 'functional';
  }

  /**
   * Detect indent size
   */
  private detectIndentSize(): number {
    // Check .editorconfig
    const editorconfigPath = path.join(this.projectRoot, '.editorconfig');
    if (fs.existsSync(editorconfigPath)) {
      const content = fs.readFileSync(editorconfigPath, 'utf8');
      const match = content.match(/indent_size\s*=\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }

    // Check .prettierrc
    const prettierPath = path.join(this.projectRoot, '.prettierrc');
    if (fs.existsSync(prettierPath)) {
      try {
        const content = fs.readFileSync(prettierPath, 'utf8');
        const config = JSON.parse(content);
        if (config.tabWidth) return config.tabWidth;
      } catch {
        // Ignore parse errors
      }
    }

    // Analyze actual code
    for (const [, content] of this.fileContents) {
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^( {2,}|\t+)/);
        if (match) {
          const indent = match[1];
          if (indent.startsWith('  ')) {
            // Count spaces
            return indent.length <= 4 ? 2 : 4;
          }
        }
      }
    }

    return 2; // Default
  }

  /**
   * Detect max line length
   */
  private detectMaxLineLength(): number {
    // Check .editorconfig
    const editorconfigPath = path.join(this.projectRoot, '.editorconfig');
    if (fs.existsSync(editorconfigPath)) {
      const content = fs.readFileSync(editorconfigPath, 'utf8');
      const match = content.match(/max_line_length\s*=\s*(\d+)/);
      if (match) return parseInt(match[1], 10);
    }

    // Check .prettierrc
    const prettierPath = path.join(this.projectRoot, '.prettierrc');
    if (fs.existsSync(prettierPath)) {
      try {
        const content = fs.readFileSync(prettierPath, 'utf8');
        const config = JSON.parse(content);
        if (config.printWidth) return config.printWidth;
      } catch {
        // Ignore parse errors
      }
    }

    return 80; // Default
  }

  /**
   * Detect conventions
   */
  private detectConventions(): Record<string, string> {
    const conventions: Record<string, string> = {};

    // Check for TypeScript strict mode
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        const content = fs.readFileSync(tsconfigPath, 'utf8');
        const config = JSON.parse(content);
        if (config.compilerOptions?.strict) {
          conventions.typescript = 'strict';
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Check for ESLint
    if (fs.existsSync(path.join(this.projectRoot, '.eslintrc')) ||
        fs.existsSync(path.join(this.projectRoot, '.eslintrc.json')) ||
        fs.existsSync(path.join(this.projectRoot, '.eslintrc.js'))) {
      conventions.linting = 'eslint';
    }

    // Check for testing
    if (fs.existsSync(path.join(this.projectRoot, 'vitest.config.ts'))) {
      conventions.testing = 'vitest';
    } else if (fs.existsSync(path.join(this.projectRoot, 'jest.config.js'))) {
      conventions.testing = 'jest';
    }

    return conventions;
  }

  /**
   * Detect protected paths
   */
  private detectProtectedPaths(): ProtectedPath[] {
    const protectedPaths: ProtectedPath[] = [
      { path: '.env', reason: 'Contains secrets' },
      { path: '.env.local', reason: 'Contains secrets' },
      { path: '.env.production', reason: 'Contains secrets' },
      { path: 'credentials.json', reason: 'Contains credentials' },
      { path: 'secrets/', reason: 'Secrets directory' }
    ];

    // Add .git if exists
    if (fs.existsSync(path.join(this.projectRoot, '.git'))) {
      protectedPaths.push({ path: '.git/', reason: 'Git repository data' });
    }

    // Add package-lock.json if exists
    if (fs.existsSync(path.join(this.projectRoot, 'package-lock.json'))) {
      protectedPaths.push({ path: 'package-lock.json', reason: 'Dependency lock file' });
    }

    return protectedPaths;
  }

  /**
   * Detect high coupling areas
   */
  private detectHighCoupling(): HighCouplingArea[] {
    // Simple heuristic: files with many imports
    const couplingAreas: HighCouplingArea[] = [];
    const importCounts: Map<string, number> = new Map();

    for (const [filePath, content] of this.fileContents) {
      // Count imports
      const importMatches = content.match(/^(import|require|from)\s/gm);
      const count = importMatches?.length ?? 0;
      importCounts.set(filePath, count);
    }

    // Find files with high import counts (>10)
    for (const [filePath, count] of importCounts) {
      if (count > 10) {
        couplingAreas.push({
          files: [path.relative(this.projectRoot, filePath)],
          risk: 'High number of dependencies',
          coupling_score: Math.min(1, count / 20)
        });
      }
    }

    return couplingAreas.slice(0, 10);
  }

  /**
   * Detect risk areas
   */
  private detectRiskAreas(): RiskArea[] {
    const riskAreas: RiskArea[] = [];

    // Check for authentication code
    const authFiles = this.scannedFiles.filter(f =>
      f.includes('auth') || f.includes('login') || f.includes('password')
    );

    if (authFiles.length > 0) {
      riskAreas.push({
        area: 'Authentication',
        risk_level: 'high',
        description: 'Authentication-related code requires careful handling',
        mitigation: 'Review all changes with security focus'
      });
    }

    // Check for payment code
    const paymentFiles = this.scannedFiles.filter(f =>
      f.includes('payment') || f.includes('checkout') || f.includes('billing')
    );

    if (paymentFiles.length > 0) {
      riskAreas.push({
        area: 'Payment Processing',
        risk_level: 'critical',
        description: 'Payment-related code has financial implications',
        mitigation: 'Require explicit approval for all changes'
      });
    }

    // Check for database migrations
    const migrationFiles = this.scannedFiles.filter(f =>
      f.includes('migration') || f.includes('migrate')
    );

    if (migrationFiles.length > 0) {
      riskAreas.push({
        area: 'Database Migrations',
        risk_level: 'high',
        description: 'Database migrations can cause data loss',
        mitigation: 'Always backup before migration changes'
      });
    }

    return riskAreas;
  }

  /**
   * Count total lines of code
   */
  private countTotalLines(): number {
    let total = 0;

    for (const content of this.fileContents.values()) {
      total += content.split('\n').length;
    }

    return total;
  }

  /**
   * Helper: Read package.json
   */
  private readPackageJson(): Record<string, unknown> | null {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) return null;

    try {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Helper: Check if dependency exists
   */
  private hasDependency(name: string): boolean {
    const packageJson = this.readPackageJson();
    if (!packageJson) return false;

    const deps = packageJson.dependencies as Record<string, string> | undefined;
    const devDeps = packageJson.devDependencies as Record<string, string> | undefined;

    return (deps?.[name] !== undefined) || (devDeps?.[name] !== undefined);
  }

  /**
   * Helper: Check if any file exists
   */
  private hasFile(...files: string[]): boolean {
    return files.some(file =>
      fs.existsSync(path.join(this.projectRoot, file))
    );
  }
}

/**
 * Export singleton factory
 */
export function createDNAScanner(projectRoot: string, options?: Partial<ScanOptions>): DNAScanner {
  return new DNAScanner(projectRoot, options);
}
