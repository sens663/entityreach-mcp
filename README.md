# EntityReach MCP

EntityReach helps enterprise teams research corporate groups and review possible expansion across existing customer accounts.

This repository contains connection examples and metadata for the hosted EntityReach MCP service. It does not contain the production backend or license company data for redistribution.

## Public connection — no account or API key

**Endpoint:** `https://entityreach.com/api/public-mcp`  
**Transport:** Streamable HTTP, with stateless JSON responses.  
**Protocol versions:** `2025-06-18` and `2025-03-26`.

| Tool | What it returns |
| --- | --- |
| `get_entityreach_product_information` | Product capabilities, pricing, access requirements and coverage limitations. |
| `list_entityreach_public_resources` | Public documentation, account-research guides, methodology and support links. |
| `get_entityreach_group_sample_analysis` | Reproducible analysis of a static Alphabet corporate-group sample. |

These tools are read-only. The public endpoint does not search live company records, return private workspaces, reveal contacts or start monitoring. The sample has 483 records across 65 country codes; records include branches and locations and must not be presented as 483 legal subsidiaries or potential buyers. The sample is not a current ownership statement or a worldwide coverage benchmark.

## Connect with Claude Code

```sh
claude mcp add --transport http entityreach-public https://entityreach.com/api/public-mcp
```

For another client, create a remote Streamable HTTP connection to the same endpoint. `cursor-mcp.json` and `vscode-mcp.json` provide the appropriate configuration shapes. The sample diagnostic client requires Node.js 20+ and no dependencies:

```sh
node entityreach-mcp-client.mjs --public get_entityreach_group_sample_analysis
```


## Connect with Gemini CLI

Install the public extension from this repository:

```sh
gemini extensions install https://github.com/sens663/entityreach-mcp
```

The root `gemini-extension.json` connects directly over Streamable HTTP and includes only the three public, read-only tools. No API key is required. It passed `gemini extensions validate` with Gemini CLI 0.63.0. The repository is tagged for the official Gemini CLI gallery's daily crawler; gallery indexing is a separate step and is not yet confirmed.

## Three useful public prompts

1. "What does EntityReach provide for enterprise account expansion, and what access is required for live company data?"
2. "Find EntityReach's corporate-group methodology, coverage information and company-data API documentation."
3. "Analyse the supplied Alphabet group sample by record type and country. Explain what the numbers do and do not establish."

## Live company data — separate authenticated connection

**Endpoint:** `https://entityreach.com/api/mcp`  
**Authentication:** `Authorization: Bearer YOUR_ENTITYREACH_API_KEY`.

Live access requires an activated workspace, a scoped EntityReach key, the relevant permissions and agreed allowances. Store the key in your client's secret settings or secure server environment. Do not put a key in a prompt, repository, URL or directory submission.

Company tools include `search_companies`, `get_company_profile`, `get_corporate_group` and `find_company_contacts`. Search requires a legal company name or identifier and a two-letter country code. Confirm an ambiguous company before retrieving its group. Contact previews do not reveal email/mobile details or consume contact-reveal credits. Workflow tools depend on workspace plan, scope and monitoring allowances.

This Bearer-key endpoint does not supply OAuth discovery. OAuth-only clients should use the separately documented ChatGPT connector and owner-approved workspace linking. A protocol handshake does not prove live data availability: test an actual company search and inspect HTTP errors, JSON-RPC errors and `isError` results.

## Documentation and support

- [MCP connection guide](https://entityreach.com/docs/mcp)
- [Company data API](https://entityreach.com/docs)
- [Coverage and methodology](https://entityreach.com/data-coverage)
- [Pricing](https://entityreach.com/pricing)
- [Privacy](https://entityreach.com/privacy)
- [Contact EntityReach](https://entityreach.com/contact)

Coverage varies by company and jurisdiction. A corporate relationship does not establish buying intent, budget, procurement independence or existing agreement coverage. Preserve the evidence classifications returned by the service.

## Publication and portable package

The public service is published in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=com.entityreach) as `com.entityreach/public-resources`, version `1.0.0`. It is also searchable in the [mcpub archive](https://mcpub.dev/) using EntityReach; its separate live scanner may take time to index it.

[`plugin/`](plugin/) contains a portable Agent Plugins package, the existing EntityReach logo and prepared review scenarios. It is not yet a ChatGPT or Claude directory listing. Developer identity verification, platform testing, a walkthrough and directory review remain separate steps. The package contains no production backend or private credentials.
