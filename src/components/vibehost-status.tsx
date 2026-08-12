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
    <Card className="w-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <Server className="w-5 h-5 text-emerald-400" />
            VibeHost MCP Service Connection
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            MatBao VibeHost Agent MCP Server integration (`/api/agent/mcp`)
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          {status === 'connected' && (
            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-300 border-emerald-500/40 flex gap-1.5 items-center px-3 py-1 font-bold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="outline" className="bg-rose-500/15 text-rose-300 border-rose-500/40 flex gap-1.5 items-center px-3 py-1 font-bold rounded-full">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              Disconnected
            </Badge>
          )}
          {/* Emerald Gradient CTA button */}
          <Button
            onClick={testConnection}
            disabled={loading}
            size="sm"
            className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all rounded-xl border-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
            ) : (
              <RefreshCw className="w-4 h-4 stroke-[3]" />
            )}
            Test Connection
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm backdrop-blur-md">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Available MCP Tools ({tools.length})
              </h4>
            </div>

            {tools.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No tools returned by server yet or server has 0 tools registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`p-4 rounded-2xl border text-sm transition-all cursor-pointer backdrop-blur-xl ${
                      selectedTool === tool.name
                        ? 'border-emerald-500/60 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                        : 'border-white/10 bg-slate-950/40 hover:border-emerald-500/30 hover:bg-slate-950/60'
                    }`}
                    onClick={() => selectToolWithTemplate(tool)}
                  >
                    <div className="font-bold text-slate-100 flex items-center justify-between gap-2">
                      <span className="font-mono text-emerald-400">{tool.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectToolWithTemplate(tool);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                    {tool.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{tool.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTool && (
              <div className="mt-6 p-5 border border-emerald-500/30 bg-slate-950/60 backdrop-blur-2xl rounded-2xl space-y-4">
                <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  Execute Tool: <code className="text-emerald-400 font-mono">{selectedTool}</code>
                </h5>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">Arguments (JSON format):</label>
                  <textarea
                    rows={4}
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    className="w-full font-mono text-xs p-3 border border-white/10 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="{}"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCallTool(selectedTool)}
                  disabled={executing}
                  className="gap-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all rounded-xl border-0"
                >
                  {executing ? <Loader2 className="w-4 h-4 animate-spin stroke-[3]" /> : <Play className="w-4 h-4 stroke-[3]" />}
                  Execute {selectedTool}
                </Button>

                {executionResult && (
                  <div className="mt-4 space-y-1">
                    <label className="text-xs text-slate-400 block font-medium">Response Result:</label>
                    <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-white/10 overflow-x-auto max-h-60 leading-relaxed">
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
