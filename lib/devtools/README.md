# CLI Integration Summary

## Directory Structure

```
lib/
  devtools/
    cli.rb # Main CLI registry
    cli/
      commands/
        ASSIGN_USER_REPORT_README.md # Documentation for individual command. Not necessary in case command --help has enough details
        assign_user_report.rb   # CLI command implementation
```

## Benefits

1. **Better Structure**: Separating the implementation from the rake task makes the code more maintainable.
2. **Flexibility**: Users can now run the command via rake or directly as a CLI command.
3. **Automation**: The CLI options allow for non-interactive usage in scripts or CI/CD pipelines.
4. **Extensibility**: Additional commands can be easily added to the CLI registry.

## Usage Instructions

```bash
# Show all cli commands
bin/devtools --help
```

```bash
# Show argument that particular cli commands expects
bin/devtools assign-user-report --help
```

See the documentation of individual command inside commands folder. Example: lib/devtools/cli/commands/ASSIGN_USER_REPORT_README.md
