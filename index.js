#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

function runCommand(command, silent = false) {
    try {
        return execSync(command, {
            stdio: silent ? 'pipe' : 'inherit',
            encoding: 'utf-8'
        });
    } catch (error) {
        console.error(chalk.red.bold('✖ Error executing command:'), chalk.dim(command));
        console.error(chalk.red(error.message));
        process.exit(1);
    }
}

function extractImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /^(?:import|from)\s+([a-zA-Z0-9_\.]+)/gm;
    const stdLibs = new Set(['sys', 'os', 'time', 'datetime', 'json', 're']);
    const packages = new Set();
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        let pkg = match[1].split('.')[0];
        if (!stdLibs.has(pkg)) {
            packages.add(pkg);
        }
    }
    return Array.from(packages);
}

function displayHeader(pythonFile) {
    console.log(boxen(
        chalk.blue.bold('Python Environment Manager') + '\n\n' +
        chalk.white(`File: ${chalk.green(pythonFile)}`),
        {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'blue'
        }
    ));
}

async function main() {
    const pythonFile = process.argv[2];
    if (!pythonFile || !fs.existsSync(pythonFile)) {
        console.error(chalk.red.bold('✖ Error:'), 'Please provide a valid Python file path');
        process.exit(1);
    }

    displayHeader(pythonFile);

    // Try to determine which Python command is available
    let pythonCommand;
    try {
        runCommand('python3 --version', true);
        pythonCommand = 'python3';
    } catch {
        try {
            runCommand('python --version', true);
            pythonCommand = 'python';
        } catch {
            console.error(chalk.red.bold('✖ Error: Neither python nor python3 command was found'));
            process.exit(1);
        }
    }

    const venvPath = 'venv';
    const venvSpinner = ora('Checking virtual environment...').start();

    if (!fs.existsSync(venvPath)) {
        venvSpinner.text = 'Creating virtual environment...';
        runCommand(`${pythonCommand} -m venv venv`, true);
        venvSpinner.succeed(chalk.green('Virtual environment created successfully'));
    } else {
        venvSpinner.succeed(chalk.green('Virtual environment already exists'));
    }

    const activateCmd = process.platform === 'win32' ?
        `${venvPath}\\Scripts\\activate` :
        `source ${venvPath}/bin/activate`;

    const packagesSpinner = ora('Analyzing Python imports...').start();
    const packages = extractImports(pythonFile);

    if (packages.length > 0) {
        packagesSpinner.succeed(chalk.green(`Found ${packages.length} package(s) to install`));

        for (const pkg of packages) {
            const installSpinner = ora(`Installing ${pkg}...`).start();
            try {
                runCommand(`${activateCmd} && pip install ${pkg}`, true);
                installSpinner.succeed(chalk.green(`Package ${pkg} installed successfully`));
            } catch (error) {
                installSpinner.fail(chalk.red(`Failed to install ${pkg}`));
                throw error;
            }
        }
    } else {
        packagesSpinner.succeed(chalk.green('No external packages required'));
    }

    console.log('\n' + chalk.cyan.bold('🚀 Launching Python script...') + '\n');

    try {
        runCommand(`${activateCmd} && ${pythonCommand} ${pythonFile}`);
        console.log('\n' + chalk.green.bold('✨ Script execution completed successfully') + '\n');
    } catch (error) {
        console.log('\n' + chalk.red.bold('❌ Script execution failed') + '\n');
        throw error;
    }
}

main().catch(error => {
    console.error(chalk.red.bold('❌ Process terminated with error'));
    process.exit(1);
});
