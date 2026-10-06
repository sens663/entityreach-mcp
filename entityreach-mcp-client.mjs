// Node.js 20+. A diagnostic client, not an OAuth implementation.
// ENTITYREACH_API_KEY is the scoped er_live_ key stored in your server environment.
// --public checks static product/sample tools without accessing a workspace.
import {pathToFileURL} from 'node:url';
const supportedVersion = '2025-06-18';
async function rpcResult(response, id) {
  if (response.headers.get('content-type')?.includes('application/json')) {
    const message = await response.json();
    if (message.id !== id) throw new Error('MCP response ID did not match the request');
    return message;
  }
  if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) throw new Error('Expected an MCP JSON or SSE response');
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let pending = '';
  const parse = frame => {
    const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
    if (!data) return;
    const message = JSON.parse(data);
    return message.id === id ? message : undefined;
  };
  try {
    while (true) {
      const {value, done} = await reader.read();
      pending += done ? decoder.decode() : decoder.decode(value, {stream:true});
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(pending))) {
        const message = parse(pending.slice(0, boundary.index));
        pending = pending.slice(boundary.index + boundary[0].length);
        if (message) return message;
      }
      if (pending.length > 5_000_000) throw new Error('MCP response frame is too large');
      if (done) { const message = parse(pending); if (message) return message; break; }
    }
    throw new Error('MCP stream ended before the requested response');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
export async function checkEntityReachMcp({token = process.env.ENTITYREACH_API_KEY, publicOnly = false, toolName, toolArguments = {}} = {}) {
  const endpoint = publicOnly ? 'https://entityreach.com/api/public-mcp' : 'https://entityreach.com/api/mcp';
  if (!publicOnly && !/^er_live_[a-f0-9]{64}$/.test(token || '')) throw new Error('Set ENTITYREACH_API_KEY to a scoped EntityReach workspace key in your server environment');
  let session, version, requestId = 0;
  const headers = () => ({...(publicOnly ? {} : {Authorization:`Bearer ${token}`}), Accept:'application/json, text/event-stream', 'Content-Type':'application/json', ...(session ? {'Mcp-Session-Id':session} : {}), ...(version ? {'MCP-Protocol-Version':version} : {})});
  async function request(method, params, notification = false) {
    const id = notification ? undefined : ++requestId;
    const response = await fetch(endpoint, {method:'POST', headers:headers(), body:JSON.stringify({jsonrpc:'2.0', ...(id === undefined ? {} : {id}), method, ...(params === undefined ? {} : {params})}), signal:AbortSignal.timeout(60_000), redirect:'error'});
    if (!response.ok) throw new Error(`MCP HTTP ${response.status}; ${response.status === 401 ? 'check the workspace key, expiry and revocation' : 'check permissions, quota and protocol support'}`);
    if (method === 'initialize') session = response.headers.get('Mcp-Session-Id');
    if (notification) { await response.body?.cancel(); return; }
    const message = await rpcResult(response, id);
    if (message.jsonrpc !== '2.0') throw new Error('Invalid MCP JSON-RPC response');
    if (message.error) throw new Error(`MCP protocol error ${message.error.code}: ${message.error.message}`);
    if (!Object.hasOwn(message, 'result')) throw new Error('MCP response has no result');
    return message.result;
  }
  try {
    const initialized = await request('initialize', {protocolVersion:supportedVersion, capabilities:{}, clientInfo:{name:'entityreach-mcp-check',version:'1.0.0'}});
    version = initialized.protocolVersion;
    if (version !== supportedVersion) throw new Error(`Server selected ${version}; use an MCP SDK supporting that protocol version`);
    if (!initialized.capabilities?.tools) throw new Error('Server did not advertise tools capability');
    await request('notifications/initialized', undefined, true);
    const tools = [], seen = new Set();
    let cursor;
    do {
      const page = await request('tools/list', cursor ? {cursor} : {});
      if (!Array.isArray(page.tools)) throw new Error('Invalid tools/list response');
      tools.push(...page.tools);
      cursor = page.nextCursor;
      if (cursor && (seen.has(cursor) || seen.size >= 100)) throw new Error('Invalid or excessive tool pagination');
      if (cursor) seen.add(cursor);
    } while (cursor);
    let result;
    if (toolName) {
      if (!tools.some(tool => tool.name === toolName)) throw new Error('Requested tool was not returned by tools/list');
      result = await request('tools/call', {name:toolName, arguments:toolArguments});
      if (result.isError) throw new Error('MCP tool reported isError: true; inspect inputs, permissions and data availability');
    }
    return {protocolVersion:version, serverInfo:initialized.serverInfo, tools, ...(result ? {result} : {})};
  } finally {
    if (session) await fetch(endpoint, {method:'DELETE', headers:headers(), signal:AbortSignal.timeout(10_000), redirect:'error'}).then(response => response.body?.cancel()).catch(() => {});
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const parameters = process.argv.slice(2), publicOnly = parameters[0] === '--public';
    const [toolName, args] = publicOnly ? parameters.slice(1) : parameters;
    const result = await checkEntityReachMcp({publicOnly, toolName, toolArguments:args ? JSON.parse(args) : {}});
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
