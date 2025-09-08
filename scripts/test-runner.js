#!/usr/bin/env node

/**
 * Comprehensive test runner for the Mountain Comparison Application
 * Runs all test suites and generates a comprehensive report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.results = {
      unit: { passed: false, output: '', duration: 0 },
      accessibility: { passed: false, output: '', duration: 0 },
      e2e: { passed: false, output: '', duration: 0 },
      performance: { passed: false, output: '', duration: 0 }
    };
    this.startTime = Date.now();
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  logSection(title) {
    this.log(`\n${'='.repeat(60)}`, colors.cyan);
    this.log(`${title}`, colors.cyan + colors.bright);
    this.log(`${'='.repeat(60)}`, colors.cyan);
  }

  async runCommand(command, testType) {
    const startTime = Date.now();
    
    try {
      this.log(`Running: ${command}`, colors.blue);
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      const duration = Date.now() - startTime;
      this.results[testType] = { passed: true, output, duration };
      this.log(`✅ ${testType} tests passed (${duration}ms)`, colors.green);
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results[testType] = { 
        passed: false, 
        output: error.stdout + error.stderr, 
        duration 
      };
      this.log(`❌ ${testType} tests failed (${duration}ms)`, colors.red);
      this.log(error.stdout, colors.yellow);
      this.log(error.stderr, colors.red);
      return false;
    }
  }

  async runUnitTests() {
    this.logSection('UNIT TESTS');
    return await this.runCommand('npm run test:run', 'unit');
  }

  async runAccessibilityTests() {
    this.logSection('ACCESSIBILITY TESTS');
    return await this.runCommand('npm run test:accessibility', 'accessibility');
  }

  async runE2ETests() {
    this.logSection('END-TO-END TESTS');
    
    // First, build the application
    this.log('Building application for E2E tests...', colors.blue);
    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('✅ Build successful', colors.green);
    } catch (error) {
      this.log('❌ Build failed', colors.red);
      this.log(error.stdout, colors.yellow);
      this.log(error.stderr, colors.red);
      return false;
    }

    return await this.runCommand('npm run test:e2e', 'e2e');
  }

  async runPerformanceTests() {
    this.logSection('PERFORMANCE TESTS');
    return await this.runCommand('npm run test:performance', 'performance');
  }

  generateReport() {
    this.logSection('TEST SUMMARY REPORT');
    
    const totalDuration = Date.now() - this.startTime;
    const passedTests = Object.values(this.results).filter(r => r.passed).length;
    const totalTests = Object.keys(this.results).length;
    
    this.log(`Total Duration: ${totalDuration}ms`, colors.blue);
    this.log(`Tests Passed: ${passedTests}/${totalTests}`, 
      passedTests === totalTests ? colors.green : colors.red);
    
    // Detailed results
    Object.entries(this.results).forEach(([testType, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? colors.green : colors.red;
      this.log(`${status} ${testType.toUpperCase()}: ${result.duration}ms`, color);
    });

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests
      },
      results: this.results
    };

    const reportPath = path.join(process.cwd(), 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`\n📊 Detailed report saved to: ${reportPath}`, colors.cyan);

    return passedTests === totalTests;
  }

  async run() {
    this.log(`${colors.bright}${colors.magenta}🧪 Mountain Comparison App - Comprehensive Test Suite${colors.reset}`);
    this.log(`Started at: ${new Date().toISOString()}`, colors.blue);

    const testSuites = [
      { name: 'Unit Tests', runner: () => this.runUnitTests() },
      { name: 'Accessibility Tests', runner: () => this.runAccessibilityTests() },
      { name: 'Performance Tests', runner: () => this.runPerformanceTests() },
      { name: 'End-to-End Tests', runner: () => this.runE2ETests() }
    ];

    let allPassed = true;

    for (const suite of testSuites) {
      const passed = await suite.runner();
      if (!passed) {
        allPassed = false;
        
        // Continue with other tests unless it's a critical failure
        if (suite.name === 'Unit Tests') {
          this.log('❌ Unit tests failed - skipping remaining tests', colors.red);
          break;
        }
      }
    }

    const reportPassed = this.generateReport();
    
    if (allPassed && reportPassed) {
      this.log(`\n🎉 All tests passed successfully!`, colors.green + colors.bright);
      process.exit(0);
    } else {
      this.log(`\n💥 Some tests failed. Check the report for details.`, colors.red + colors.bright);
      process.exit(1);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const runner = new TestRunner();

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Mountain Comparison App Test Runner

Usage: node scripts/test-runner.js [options]

Options:
  --help, -h     Show this help message
  --unit         Run only unit tests
  --a11y         Run only accessibility tests
  --e2e          Run only end-to-end tests
  --performance  Run only performance tests

Examples:
  node scripts/test-runner.js              # Run all tests
  node scripts/test-runner.js --unit       # Run only unit tests
  node scripts/test-runner.js --e2e        # Run only E2E tests
`);
  process.exit(0);
}

// Run specific test suites based on arguments
if (args.includes('--unit')) {
  runner.runUnitTests().then(passed => process.exit(passed ? 0 : 1));
} else if (args.includes('--a11y')) {
  runner.runAccessibilityTests().then(passed => process.exit(passed ? 0 : 1));
} else if (args.includes('--e2e')) {
  runner.runE2ETests().then(passed => process.exit(passed ? 0 : 1));
} else if (args.includes('--performance')) {
  runner.runPerformanceTests().then(passed => process.exit(passed ? 0 : 1));
} else {
  // Run all tests
  runner.run();
}