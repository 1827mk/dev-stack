#!/bin/bash

# Dev-Stack v6 Setup Script
# Initializes the plugin environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Dev-Stack v6 Setup${NC}"
echo "====================="
echo ""

# Check Node.js version
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js version 18+ required, found $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠ git not found - rollback features will be limited${NC}"
else
    echo -e "${GREEN}✓ git $(git --version | cut -d' ' -f3)${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Create runtime directories
echo ""
echo -e "${YELLOW}Creating runtime directories...${NC}"
mkdir -p .dev-stack/dna
mkdir -p .dev-stack/memory/sentinels
mkdir -p .dev-stack/logs
mkdir -p .dev-stack/config

# Initialize pattern database
echo ""
echo -e "${YELLOW}Initializing pattern database...${NC}"
if [ ! -f .dev-stack/memory/patterns.db ]; then
    echo '{"version":"1.0","patterns":[],"lastUpdated":"'"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)"'"}' > .dev-stack/memory/patterns.db
    echo -e "${GREEN}✓ Created patterns.db${NC}"
else
    echo -e "${GREEN}✓ patterns.db already exists${NC}"
fi

# Initialize scope configuration
if [ ! -f .dev-stack/config/scope.json ]; then
    cat > .dev-stack/config/scope.json << 'EOF'
{
  "version": "1.0",
  "protected_paths": [
    ".env",
    ".env.local",
    ".env.*.local",
    "**/secrets/**",
    "**/credentials/**",
    ".git/**"
  ],
  "dangerous_commands": [
    "rm -rf /",
    "rm -rf ~",
    "rm -rf *"
  ]
}
EOF
    echo -e "${GREEN}✓ Created scope.json${NC}"
else
    echo -e "${GREEN}✓ scope.json already exists${NC}"
fi

# Run TypeScript compilation check
echo ""
echo -e "${YELLOW}Checking TypeScript compilation...${NC}"
if npm run build 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠ TypeScript compilation has issues (this may be expected for plugin development)${NC}"
fi

# Run tests
echo ""
echo -e "${YELLOW}Running tests...${NC}"
if npm test 2>/dev/null; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Some tests failed (this may be expected for initial setup)${NC}"
fi

# Final message
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Dev-Stack v6 Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Available commands:"
echo "  /dev-stack:agent [task]     - Execute task with full workflow"
echo "  /dev-stack:learn            - Force DNA rescan"
echo "  /dev-stack:status           - Show dashboard"
echo "  /dev-stack:checkpoint       - Create checkpoint"
echo "  /dev-stack:rollback         - Rollback changes"
echo "  /dev-stack:history          - Show action history"
echo "  /dev-stack:transfer [path]  - Transfer patterns"
echo ""
echo "Documentation: ./README.md"
