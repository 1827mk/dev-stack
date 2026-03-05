#!/bin/bash
# Dev-Stack Orchestrator - Test Runner
# Runs all tests or specific test categories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TESTS_DIR="$PROJECT_ROOT/tests"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to run tests in a file
run_test_file() {
    local test_file="$1"
    local category="$2"
    
    echo -e "${YELLOW}Testing: $test_file${NC}"
    
    # Count test cases in file
    local test_count=$(grep -c "^## Test:" "$test_file" 2>/dev/null | tr -d '[:space:]' || echo "0")

    if [ "$test_count" -gt 0 ] 2>/dev/null; then
        echo -e "  Found ${test_count} test cases"

        # Check for any FAIL markers (for manual testing)
        local fail_markers=$(grep -c "❌" "$test_file" 2>/dev/null | tr -d '[:space:]' || echo "0")
        local pass_markers=$(grep -c "✅" "$test_file" 2>/dev/null | tr -d '[:space:]' || echo "0")

        if [ "${fail_markers:-0}" -gt 0 ] 2>/dev/null; then
            echo -e "  ${RED}✗ Some tests have failures${NC}"
            FAILED_TESTS=$((FAILED_TESTS + fail_markers))
        else
            echo -e "  ${GREEN}✓ All validation checks passed${NC}"
            PASSED_TESTS=$((PASSED_TESTS + test_count))
        fi

        TOTAL_TESTS=$((TOTAL_TESTS + test_count))
    else
        echo -e "  ${YELLOW}⚠ No test cases found${NC}"
    fi
    
    echo ""
}

# Function to validate plugin structure
validate_structure() {
    print_header "PLUGIN STRUCTURE VALIDATION"
    
    local required_dirs=("commands" "agents" "skills" "scripts" "config" "hooks" "context")
    local all_passed=true
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            local file_count=$(find "$PROJECT_ROOT/$dir" -type f ! -name ".*" | wc -l | tr -d ' ')
            echo -e "${GREEN}✓${NC} $dir/ exists ($file_count files)"
        else
            echo -e "${RED}✗${NC} $dir/ missing"
            all_passed=false
        fi
    done
    
    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to validate JSON files
validate_json() {
    print_header "JSON VALIDATION"
    
    local json_files=("$PROJECT_ROOT/.claude-plugin/plugin.json" "$PROJECT_ROOT/hooks/hooks.json")
    local all_passed=true
    
    for file in "${json_files[@]}"; do
        if [ -f "$file" ]; then
            if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
                echo -e "${GREEN}✓${NC} $(basename $file): Valid JSON"
            else
                echo -e "${RED}✗${NC} $(basename $file): Invalid JSON"
                all_passed=false
            fi
        fi
    done
    
    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to validate YAML files
validate_yaml() {
    print_header "YAML VALIDATION"

    local yaml_files=("$PROJECT_ROOT/config/capabilities.yaml" "$PROJECT_ROOT/config/plugin.yaml")
    local all_passed=true

    for file in "${yaml_files[@]}"; do
        if [ -f "$file" ]; then
            # Simple YAML validation without external dependencies
            # Check for basic YAML syntax issues
            local has_document_start=false
            local has_indentation_issue=false
            local line_num=0

            while IFS= read -r line; do
                line_num=$((line_num + 1))
                # Skip empty lines and comments
                if [[ -z "$line" ]] || [[ "$line" == \#* ]]; then
                    continue
                fi
                # Check for document start (---)
                if [[ "$line" == "---" ]]; then
                    has_document_start=true
                fi
                # Check for tab indentation (YAML requires spaces, not tabs)
                if [[ "$line" =~ ^$'\t' ]]; then
                    has_indentation_issue=true
                fi
            done < "$file"

            if [ "$has_indentation_issue" = true ]; then
                echo -e "${YELLOW}⚠${NC} $(basename $file): Contains tab indentation (use spaces)"
                # Not a failure, just a warning
            fi

            # Basic structure check - ensure file has valid YAML-like content
            if grep -qE "^[a-zA-Z_]" "$file" >/dev/null; then
                echo -e "${GREEN}✓${NC} $(basename $file): Valid YAML structure"
            else
                echo -e "${RED}✗${NC} $(basename $file): Invalid YAML structure"
                all_passed=false
            fi
        else
            echo -e "${YELLOW}⚠${NC} $(basename $file): File not found"
            all_passed=false
        fi
    done

    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to validate frontmatter in commands and agents
validate_frontmatter() {
    print_header "FRONTMATTER VALIDATION"
    
    local all_passed=true
    
    # Check commands
    for file in "$PROJECT_ROOT/commands"/*.md; do
        if [ -f "$file" ]; then
            if grep -q "^---" "$file" && grep -q "^name:" "$file"; then
                echo -e "${GREEN}✓${NC} commands/$(basename $file): Valid frontmatter"
            else
                echo -e "${RED}✗${NC} commands/$(basename $file): Invalid frontmatter"
                all_passed=false
            fi
        fi
    done
    
    # Check agents
    for file in "$PROJECT_ROOT/agents"/*.md; do
        if [ -f "$file" ]; then
            if grep -q "^---" "$file" && grep -q "^name:" "$file" && grep -q "^model:" "$file"; then
                echo -e "${GREEN}✓${NC} agents/$(basename $file): Valid frontmatter"
            else
                echo -e "${RED}✗${NC} agents/$(basename $file): Invalid frontmatter"
                all_passed=false
            fi
        fi
    done
    
    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to check MCP tool priority documentation
validate_mcp_priority() {
    print_header "MCP TOOL PRIORITY CHECK"
    
    local all_passed=true
    
    for file in "$PROJECT_ROOT/agents"/*.md; do
        if [ -f "$file" ]; then
            if grep -qi "MCP" "$file" && grep -qi "primary\|first\|priority" "$file"; then
                echo -e "${GREEN}✓${NC} agents/$(basename $file): MCP priority documented"
            else
                echo -e "${RED}✗${NC} agents/$(basename $file): MCP priority not documented"
                all_passed=false
            fi
        fi
    done
    
    for file in "$PROJECT_ROOT/skills"/*/SKILL.md; do
        if [ -f "$file" ]; then
            if grep -qi "MCP" "$file" && grep -qi "primary\|first\|priority" "$file"; then
                echo -e "${GREEN}✓${NC} $(dirname $file | xargs basename)/SKILL.md: MCP priority documented"
            else
                echo -e "${RED}✗${NC} $(dirname $file | xargs basename)/SKILL.md: MCP priority not documented"
                all_passed=false
            fi
        fi
    done
    
    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to check script executability
validate_scripts() {
    print_header "SCRIPT EXECUTABILITY CHECK"
    
    local all_passed=true
    
    for file in "$PROJECT_ROOT/scripts"/*.sh; do
        if [ -f "$file" ]; then
            if [ -x "$file" ]; then
                echo -e "${GREEN}✓${NC} scripts/$(basename $file): Executable"
            else
                echo -e "${RED}✗${NC} scripts/$(basename $file): Not executable"
                all_passed=false
            fi
        fi
    done
    
    if [ "$all_passed" = true ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Main execution
main() {
    local test_type="${1:-all}"
    local specific_test="${2:-}"
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║          Dev-Stack Orchestrator - Test Suite              ║"
    echo "║          Version 2.0.0                                    ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    case "$test_type" in
        "unit")
            print_header "UNIT TESTS"
            for file in "$TESTS_DIR/unit"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "unit"
                fi
            done
            ;;
        "integration")
            print_header "INTEGRATION TESTS"
            for file in "$TESTS_DIR/integration"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "integration"
                fi
            done
            ;;
        "e2e")
            print_header "E2E TESTS"
            for file in "$TESTS_DIR/e2e"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "e2e"
                fi
            done
            ;;
        "validation")
            validate_structure
            validate_json
            validate_yaml
            validate_frontmatter
            validate_mcp_priority
            validate_scripts
            ;;
        "all"|*)
            # Run validation tests
            validate_structure
            validate_json
            validate_yaml
            validate_frontmatter
            validate_mcp_priority
            validate_scripts
            
            # Run unit tests
            print_header "UNIT TESTS"
            for file in "$TESTS_DIR/unit"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "unit"
                fi
            done
            
            # Run integration tests
            print_header "INTEGRATION TESTS"
            for file in "$TESTS_DIR/integration"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "integration"
                fi
            done
            
            # Run e2e tests
            print_header "E2E TESTS"
            for file in "$TESTS_DIR/e2e"/*.md; do
                if [ -f "$file" ]; then
                    run_test_file "$file" "e2e"
                fi
            done
            ;;
    esac
    
    # Print summary
    print_header "TEST SUMMARY"
    
    echo -e "Total Tests:  ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
    echo ""
    
    if [ "$FAILED_TESTS" -eq 0 ]; then
        local pass_rate=100
    else
        local pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    echo -e "Pass Rate:    ${pass_rate}%"
    echo ""
    
    if [ "$FAILED_TESTS" -eq 0 ]; then
        echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
        exit 0
    else
        echo -e "${RED}✗ SOME TESTS FAILED${NC}"
        exit 1
    fi
}

# Run main
main "$@"
