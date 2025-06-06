# Py-Run

Py-Run is a command-line interface (CLI) tool that streamlines running Python files with a single command. It automates environment setup and dependency management, saving you time and effort when working with Python scripts.

## Features

- **One-Command Execution**: Run any Python file with a single command.
- **Automatic Virtual Environment**: PyRun automatically creates and registers a virtual environment if one doesn't already exist.
- **Dependency Detection & Installation**: It scans your Python file for imported packages, installs any missing dependencies, and ensures your environment is ready to run the script.
- **Seamless Workflow**: All steps—environment setup, dependency installation, and script execution—are handled automatically, streamlining your Python development process.

## Usage

To run a Python file, simply use:

```bash
py-run <your_script.py>
```

Or if you don't want to install globally you can use npx as follows:

```bash
npx py-run <your_script.py>
```

Py-Run will:

1. Create or activate a virtual environment.
2. Detect and install any required packages based on your script's imports.
3. Execute your Python file.

## Benefits

- **Saves Time**: No need to manually set up environments or install packages.
- **Reduces Errors**: Ensures all dependencies are installed before running your script.
- **Simplifies Workflow**: Focus on writing code, not on setup.

---

Start using Py-Run to make your Python development faster and more efficient! 