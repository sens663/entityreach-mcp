# EntityReach public resources plugin

Portable MCP package for the hosted EntityReach public resources endpoint. It contains no server backend, credentials, private company data or bundled skills.

## Available behavior

- Read product capabilities, access requirements and limitations.
- Find public setup, research and methodology resources.
- Inspect a supplied static corporate-group sample.

Live company data uses a separately activated workspace, scoped key and agreed allowances. This package does not provide that access.

## Publication status

This package is prepared for upload; it has not been submitted to ChatGPT or Claude's directory. OpenAI's portal currently requires developer identity verification before creation or upload. Five positive and three negative review scenarios are declared in plugin.json. MCP protocol checks are recorded separately; these are not evidence of end-to-end execution inside ChatGPT or Claude. An actual plugin walkthrough, platform scan and review are still required before public directory approval.

The logo is EntityReach's existing public SVG asset. No production server code or dataset license is granted by this package.

## Endpoint

https://entityreach.com/api/public-mcp

Streamable HTTP, no authentication, protocol 2025-06-18.

## Install manually

Use an MCP client that supports a remote Streamable HTTP endpoint. The parent repository includes Cursor/VS Code configurations and a Node.js diagnostic client. For a Claude directory submission, the single remote connector route can use the endpoint directly.
