import { NextResponse } from 'next/server';
import {
  fetchRegulations,
  createRegulation,
  updateRegulationRecord,
  removeRegulationRecord,
} from '@/lib/db';

export async function GET() {
  try {
    const regulations = await fetchRegulations();
    return NextResponse.json({ success: true, data: regulations });
  } catch (error: any) {
    console.error('[API /api/regulations GET Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const regulation = await createRegulation(body);
    return NextResponse.json({ success: true, data: regulation });
  } catch (error: any) {
    console.error('[API /api/regulations POST Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Regulation ID is required' }, { status: 400 });
    }
    await updateRegulationRecord(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/regulations PUT Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Regulation ID is required' }, { status: 400 });
    }
    await removeRegulationRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/regulations DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
