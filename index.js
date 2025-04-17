#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function printStep(message) {
  console.log(`${colors.cyan}[STEP]${colors.reset} ${message}`);
}

function printSuccess(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function printError(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

class ReactNativeInstaller {
  constructor() {
    this.platform = process.platform;
  }

  async execute() {
    console.log(`${colors.cyan}React Native Environment Setup${colors.reset}`);
    console.log('----------------------------');
    console.log(`Detected platform: ${this.platform}\n`);

    try {
      // Check prerequisites
      await this.checkPrerequisites();

      // Install Node.js if not present
      await this.checkNodeJS();

      // Install React Native CLI
      await this.installReactNativeCLI();

      // Platform-specific setups
      if (this.platform === 'darwin') {
        await this.setupMacOS();
      } else if (this.platform === 'linux') {
        await this.setupLinux();
      } else if (this.platform === 'win32') {
        await this.setupWindows();
      }

      printSuccess('React Native environment setup completed successfully!');
      this.printNextSteps();
    } catch (error) {
      printError(`Installation failed: ${error.message}`);
      process.exit(1);
    }
  }

  checkCommand(command) {
    try {
      execSync(`${command} --version`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkPrerequisites() {
    printStep('Checking prerequisites...');

    // Check for git
    if (!this.checkCommand('git')) {
      printWarning('Git is not installed. Please install Git and run this script again.');
      process.exit(1);
    }

    printSuccess('Prerequisites check complete.');
  }

  async checkNodeJS() {
    printStep('Checking Node.js installation...');

    if (!this.checkCommand('node')) {
      printStep('Node.js not found. Installing using NVM...');
      
      // Install NVM
      if (this.platform === 'win32') {
        printWarning('Please install Node.js from https://nodejs.org/');
        process.exit(1);
      } else {
        execSync('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash', { stdio: 'inherit' });
        execSync('source ~/.bashrc && nvm install --lts', { stdio: 'inherit' });
      }
    } else {
      printSuccess('Node.js is already installed.');
    }
  }

  async installReactNativeCLI() {
    printStep('Installing React Native CLI...');
    execSync('npm install -g react-native-cli', { stdio: 'inherit' });
    printSuccess('React Native CLI installed successfully.');
  }

  async setupMacOS() {
    printStep('Setting up macOS development environment...');

    // Check for Homebrew
    if (!this.checkCommand('brew')) {
      printStep('Installing Homebrew...');
      execSync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"', { stdio: 'inherit' });
    }

    // Install watchman
    printStep('Installing watchman...');
    execSync('brew install watchman', { stdio: 'inherit' });

    // Check for Xcode
    if (!this.checkCommand('xcode-select')) {
      printWarning('Xcode is not installed. Please install Xcode from the App Store.');
    }

    // Install Java
    printStep('Installing Java Development Kit...');
    execSync('brew install adoptopenjdk/openjdk/adoptopenjdk11', { stdio: 'inherit' });

    // Install Android Studio
    const answer = await this.question(`Would you like to download Android Studio? (y/n): `);
    if (answer.toLowerCase() === 'y') {
      execSync('open https://developer.android.com/studio', { stdio: 'inherit' });
      printWarning('Please complete Android Studio installation and setup Android SDK manually.');
    }

    printSuccess('macOS development environment setup complete.');
  }

  async setupLinux() {
    printStep('Setting up Linux development environment...');

    // Install Java
    printStep('Installing Java Development Kit...');
    execSync('sudo apt-get update', { stdio: 'inherit' });
    execSync('sudo apt-get install -y openjdk-11-jdk', { stdio: 'inherit' });

    // Install Linux-specific dependencies
    printStep('Installing additional dependencies...');
    execSync('sudo apt-get install -y android-tools-adb android-tools-fastboot', { stdio: 'inherit' });

    // Android Studio
    const answer = await this.question(`Would you like to download Android Studio? (y/n): `);
    if (answer.toLowerCase() === 'y') {
      execSync('xdg-open https://developer.android.com/studio', { stdio: 'inherit' });
      printWarning('Please complete Android Studio installation and setup Android SDK manually.');
    }

    printSuccess('Linux development environment setup complete.');
  }

  async setupWindows() {
    printStep('Setting up Windows development environment...');

    // Install Chocolatey if not present
    if (!this.checkCommand('choco')) {
      printStep('Installing Chocolatey...');
      execSync('powershell Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://chocolatey.org/install.ps1\'))', { stdio: 'inherit' });
    }

    // Install Java
    printStep('Installing Java Development Kit...');
    execSync('choco install -y openjdk11', { stdio: 'inherit' });

    // Android Studio
    const answer = await this.question(`Would you like to download Android Studio? (y/n): `);
    if (answer.toLowerCase() === 'y') {
      execSync('start https://developer.android.com/studio', { stdio: 'inherit' });
      printWarning('Please complete Android Studio installation and setup Android SDK manually.');
    }

    printSuccess('Windows development environment setup complete.');
  }

  printNextSteps() {
    console.log('\n📋 Next Steps:');
    console.log('1. Configure Android Studio and install Android SDK');
    console.log('2. Set ANDROID_HOME environment variable');
    console.log('3. Add platform-tools to PATH');
    console.log('4. Run "react-native doctor" to verify your installation');
    console.log('5. Create your first app: "npx react-native init MyApp"');
  }

  question(query) {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Main execution
const installer = new ReactNativeInstaller();
installer.execute().then(() => {
  rl.close();
});