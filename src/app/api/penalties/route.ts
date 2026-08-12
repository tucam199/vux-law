import { NextResponse } from 'next/server';
import {
  fetchPenalties,
  createPenalty,
  createMultiplePenalties,
  updatePenaltyRecord,
  removePenaltyRecord,
} from '@/lib/db';

export async function GET() {
  try {
    const penalties = await fetchPenalties();
    return NextResponse.json({ success: true, data: penalties });
  } catch (error: any) {
    console.error('[API /api/penalties GET Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body.penalties)) {
      await createMultiplePenalties(body.penalties);
      return NextResponse.json({ success: true });
    }
    const penalty = await createPenalty(body);
    return NextResponse.json({ success: true, data: penalty });
  } catch (error: any) {
    console.error('[API /api/penalties POST Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Penalty ID is required' }, { status: 400 });
    }
    await updatePenaltyRecord(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/penalties PUT Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Penalty ID is required' }, { status: 400 });
    }
    await removePenaltyRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API /api/penalties DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
