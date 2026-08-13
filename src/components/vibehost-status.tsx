'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Server, CheckCircle2, XCircle, Wrench, Play, RefreshCw } from 'lucide-react';
import { McpTool } from '@/lib/vibehost';

export function VibeHostStatus() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tools, setTools] = useState<McpTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolArgs, setToolArgs] = useState<string>('{}');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const initRes = await fetch('/api/vibehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize connection');
      }

      const toolsRes = await fetch('/api/vibehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'listTools' }),
      });

      const toolsData = await toolsRes.json();
      if (toolsData.success) {
        setTools(toolsData.tools || []);
      }

      setStatus('connected');
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setStatus('error');
      setErrorMsg(err?.message || 'Connecting to VibeHost MCP Server failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectToolWithTemplate = (tool: McpTool) => {
    setSelectedTool(tool.name);
    setExecutionResult(null);

    let template: Record<string, any> = {};
    if (tool.inputSchema?.properties) {
      Object.keys(tool.inputSchema.properties).forEach((key) => {
        const prop = tool.inputSchema?.properties[key];
        if (key === 'projectId') {
          template[key] = 'cmspu5cn4034i0i5f33xd6vuf';
        } else if (key === 'stackId') {
          template[key] = 'nhap_stack_id_tu_list_stacks';
        } else if (key === 'action') {
          template[key] = prop?.enum ? prop.enum[0] : 'start';
        } else if (prop?.default !== undefined) {
          template[key] = prop.default;
        } else if (prop?.type === 'string') {
          template[key] = '';
        } else if (prop?.type === 'integer' || prop?.type === 'number') {
          template[key] = 0;
        } else if (prop?.type === 'boolean') {
          template[key] = false;
        }
      });
    }

    setToolArgs(JSON.stringify(template, null, 2));
  };

  const handleCallTool = async (toolName: string) => {
    setExecuting(true);
    setExecutionResult(null);
    try {
      let parsedArgs = {};
      if (toolArgs.trim()) {
        try {
          parsedArgs = JSON.parse(toolArgs);
        } catch (e) {
          throw new Error('Arguments must be valid JSON');
        }
      }

      const res = await fetch('/api/vibehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'callTool',
          name: toolName,
          args: parsedArgs,
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ success: false, error: err?.message });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Card className="w-full bg-white border border-[#DEE2E6] shadow-xs rounded overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-[#DEE2E6] gap-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-[#212529]">
            <Server className="w-4 h-4 text-[#017E84]" />
            VibeHost MCP Technical Integration
          </CardTitle>
          <CardDescription className="text-[#6C757D] text-xs">
            MatBao VibeHost Agent MCP Server integration (`/api/agent/mcp`)
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <Badge variant="outline" className="bg-[#28A745]/10 text-[#28A745] border-[#28A745]/30 flex gap-1 items-center px-2.5 py-0.5 text-xs font-semibold rounded">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 flex gap-1 items-center px-2.5 py-0.5 text-xs font-semibold rounded">
              <XCircle className="w-3.5 h-3.5" />
              Disconnected
            </Badge>
          )}
          <button
            onClick={testConnection}
            disabled={loading}
            className="btn-odoo-purple text-xs"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Test Connection
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#212529] uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#017E84]" />
                Available MCP Tools ({tools.length})
              </h4>
            </div>

            {tools.length === 0 ? (
              <p className="text-xs text-[#6C757D] italic">No tools returned by server yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`p-3 rounded border text-xs transition-all cursor-pointer ${
                      selectedTool === tool.name
                        ? 'border-[#714B67] bg-[#714B67]/10'
                        : 'border-[#DEE2E6] bg-white hover:border-[#017E84]'
                    }`}
                    onClick={() => selectToolWithTemplate(tool)}
                  >
                    <div className="font-bold text-[#212529] flex items-center justify-between gap-2">
                      <span className="font-mono text-[#017E84]">{tool.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[11px] px-2 text-[#017E84] hover:bg-[#017E84]/10 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectToolWithTemplate(tool);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                    {tool.description && (
                      <p className="text-[11px] text-[#6C757D] mt-1 line-clamp-2">{tool.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTool && (
              <div className="mt-4 p-4 border border-[#DEE2E6] bg-[#F8F9FA] rounded space-y-3">
                <h5 className="text-xs font-bold text-[#212529] flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#714B67]" />
                  Execute Tool: <code className="text-[#017E84] font-mono">{selectedTool}</code>
                </h5>

                <div>
                  <label className="text-[11px] text-[#6C757D] block mb-1 font-medium">Arguments (JSON format):</label>
                  <textarea
                    rows={4}
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    className="w-full font-mono text-xs p-2.5 border border-[#DEE2E6] rounded bg-white text-[#212529] focus:outline-none focus:border-[#714B67]"
                    placeholder="{}"
                  />
                </div>

                <button
                  onClick={() => handleCallTool(selectedTool)}
                  disabled={executing}
                  className="btn-odoo-teal text-xs"
                >
                  {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Execute {selectedTool}
                </button>

                {executionResult && (
                  <div className="mt-3 space-y-1">
                    <label className="text-[11px] text-[#6C757D] block font-medium">Response Result:</label>
                    <pre className="p-3 bg-[#212529] text-[#28A745] font-mono text-[11px] rounded border border-[#DEE2E6] overflow-x-auto max-h-60">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
