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
      // Step 1: Handshake
      const initRes = await fetch('/api/vibehost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });

      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initialize connection');
      }

      // Step 2: Fetch tools
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
    <Card className="w-full shadow-md border border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            VibeHost MCP Service Connection
          </CardTitle>
          <CardDescription>
            MatBao VibeHost Agent MCP Server integration (`/api/agent/mcp`)
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 flex gap-1 items-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </Badge>
          )}
          {status === 'error' && (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 flex gap-1 items-center">
              <XCircle className="w-3.5 h-3.5" />
              Disconnected
            </Badge>
          )}
          <Button
            onClick={testConnection}
            disabled={loading}
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Test Connection
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-sm">
            <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-indigo-500" />
                Available MCP Tools ({tools.length})
              </h4>
            </div>

            {tools.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No tools returned by server yet or server has 0 tools registered.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`p-3 rounded-lg border text-sm transition-all cursor-pointer ${
                      selectedTool === tool.name
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    }`}
                    onClick={() => setSelectedTool(tool.name)}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{tool.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1 text-indigo-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTool(tool.name);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                    {tool.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tool.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTool && (
              <div className="mt-4 p-4 border border-indigo-200 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-3">
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Play className="w-4 h-4 text-indigo-600" />
                  Execute Tool: <code className="text-indigo-600">{selectedTool}</code>
                </h5>

                <div>
                  <label className="text-xs text-slate-500 block mb-1">Arguments (JSON format):</label>
                  <textarea
                    rows={3}
                    value={toolArgs}
                    onChange={(e) => setToolArgs(e.target.value)}
                    className="w-full font-mono text-xs p-2 border rounded-md bg-white dark:bg-slate-950 dark:border-slate-800"
                    placeholder="{}"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={() => handleCallTool(selectedTool)}
                  disabled={executing}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Execute {selectedTool}
                </Button>

                {executionResult && (
                  <div className="mt-3">
                    <label className="text-xs text-slate-500 block mb-1">Response Result:</label>
                    <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-md overflow-x-auto max-h-60">
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
