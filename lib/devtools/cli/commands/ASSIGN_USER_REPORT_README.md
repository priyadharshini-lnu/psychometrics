# Assign User Report CLI Documentation

## Overview

This tool allows you to assign reports to users within campaigns. The CLI  provides both interactive prompts and command-line options for automation.

## Usage

### Via CLI

```bash
# Show help
bin/devtools assign-user-report --help

# Run interactively
bin/devtools assign-user-report

# Create new user, new report and new assessment
bin/devtools assign-user-report --campaign-id=123 --user-id=n --report-id=n --assessment-id=n

# Run with specific parameters
bin/devtools assign-user-report --campaign-id=123 --user-id=456 --report-id=789 --assessment-id=101
```

## Options

- `--campaign-id`: Campaign ID where user needs to be assigned report in
- `--user-id`: Existing User ID (leave empty to create a new user)
- `--report-id`: Existing Report ID (leave empty to create a new report)
- `--assessment-id`: Existing Assessment ID (leave empty to create a new assessment)

## Examples

1. Create everything from scratch with interactive prompts:
   ```bash
   bin/devtools assign-user-report
   ```

2. Use an existing user in an existing campaign with a new report:
   ```bash
   bin/devtools assign-user-report --campaign-id=123 --user-id=456
   ```

3. Complete automation with all parameters:
   ```bash
   bin/devtools assign-user-report --campaign-id=123 --user-id=456 --report-id=789 --assessment-id=101
   ```
