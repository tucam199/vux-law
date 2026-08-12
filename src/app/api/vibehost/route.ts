import { NextResponse } from 'next/server';
import { vibehostClient } from '@/lib/vibehost';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, method, name, args, params } = body;

    switch (action) {
      case 'initialize': {
        const result = await vibehostClient.initialize();
        return NextResponse.json({ success: true, data: result });
      }

      case 'listTools': {
        const tools = await vibehostClient.listTools();
        return NextResponse.json({ success: true, tools });
      }

      case 'callTool': {
        if (!name) {
          return NextResponse.json(
            { success: false, error: 'Tool "name" is required for callTool' },
            { status: 400 }
          );
        }
        const result = await vibehostClient.callTool(name, args || {});
        return NextResponse.json({ success: true, data: result });
      }

      case 'listPrompts': {
        const result = await vibehostClient.listPrompts();
        return NextResponse.json({ success: true, data: result });
      }

      case 'listResources': {
        const result = await vibehostClient.listResources();
        return NextResponse.json({ success: true, data: result });
      }

      case 'raw': {
        if (!method) {
          return NextResponse.json(
            { success: false, error: 'RPC "method" is required for raw action' },
            { status: 400 }
          );
        }
        const result = await vibehostClient.sendRpcRequest(method, params || {});
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: `Invalid action "${action}". Allowed: initialize, listTools, callTool, listPrompts, listResources, raw`,
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API /api/vibehost] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal Server Error while communicating with VibeHost MCP Server',
      },
      { status: 500 }
    );
  }
}
