export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface McpJsonRpcResponse<T = any> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, any>;
}

export interface McpToolListResult {
  tools: McpTool[];
}

export interface McpCallToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: any;
  }>;
  isError?: boolean;
}

export class VibeHostClient {
  private serverUrl: string;
  private token: string;
  private requestIdCounter = 1;

  constructor(serverUrl?: string, token?: string) {
    this.serverUrl =
      serverUrl ||
      process.env.VIBEHOST_MCP_URL ||
      'https://vibehost.matbao.ai/api/agent/mcp';
    this.token =
      token ||
      process.env.VIBEHOST_PAT ||
      '';
  }

  /**
   * Send a raw JSON-RPC 2.0 request to VibeHost MCP Server
   */
  async sendRpcRequest<T = any>(
    method: string,
    params: Record<string, any> = {}
  ): Promise<McpJsonRpcResponse<T>> {
    if (!this.token) {
      throw new Error('VibeHost Personal Access Token (PAT) is not configured.');
    }

    const payload: McpJsonRpcRequest = {
      jsonrpc: '2.0',
      id: this.requestIdCounter++,
      method,
      params,
    };

    const response = await fetch(this.serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`VibeHost HTTP Error [${response.status}]: ${errorText}`);
    }

    const data: McpJsonRpcResponse<T> = await response.json();
    if (data.error) {
      throw new Error(`VibeHost MCP Error [${data.error.code}]: ${data.error.message}`);
    }

    return data;
  }

  /**
   * Initialize MCP handshake
   */
  async initialize() {
    return this.sendRpcRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'vux-law-app',
        version: '1.0.0',
      },
    });
  }

  /**
   * List available tools on VibeHost MCP Server
   */
  async listTools(): Promise<McpTool[]> {
    const res = await this.sendRpcRequest<McpToolListResult>('tools/list', {});
    return res.result?.tools || [];
  }

  /**
   * Execute a tool on VibeHost MCP Server
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<McpCallToolResult> {
    const res = await this.sendRpcRequest<McpCallToolResult>('tools/call', {
      name,
      arguments: args,
    });
    return res.result || { content: [] };
  }

  /**
   * List available prompts
   */
  async listPrompts() {
    const res = await this.sendRpcRequest('prompts/list', {});
    return res.result;
  }

  /**
   * List available resources
   */
  async listResources() {
    const res = await this.sendRpcRequest('resources/list', {});
    return res.result;
  }
}

// Export singleton instance for server-side use
export const vibehostClient = new VibeHostClient();
