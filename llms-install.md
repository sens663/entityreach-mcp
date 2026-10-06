# Configure EntityReach's public MCP

Use the hosted Streamable HTTP endpoint `https://entityreach.com/api/public-mcp`. No account, credential, payment, local server or dependency installation is required.

Send `initialize` with protocol version `2025-06-18`, then `notifications/initialized`, then `tools/list`. Accept JSON responses. Discover and call the three returned read-only public tools. Do not invent other tool names or imply that the sample is live company data.

For VS Code, use the `servers` configuration in `vscode-mcp.json`. For Cursor, use the `mcpServers` configuration in `cursor-mcp.json`. Claude Code supports `claude mcp add --transport http entityreach-public https://entityreach.com/api/public-mcp`.

The separate `https://entityreach.com/api/mcp` endpoint requires an activated workspace and a scoped Bearer key. Keep credentials in secure client settings; never ask someone to paste a key into a conversation. See https://entityreach.com/docs/mcp for account activation, permissions and troubleshooting.
