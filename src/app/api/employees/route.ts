import { NextResponse } from 'next/server';
import { fetchEmployees, createEmployee, updateEmployeeRecord, removeEmployeeRecord } from '@/lib/db';

export async function GET() {
  try {
    const employees = await fetchEmployees();
    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, position, department } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (id) {
      await updateEmployeeRecord(id, { name, position, department });
      return NextResponse.json({ success: true });
    } else {
      const created = await createEmployee({ name, position, department });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error: any) {
    console.error('Error saving employee:', error);
    return NextResponse.json(
      { error: 'Failed to save employee', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await removeEmployeeRecord(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee', details: error?.message },
      { status: 500 }
    );
  }
}
