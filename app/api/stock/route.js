import { NextResponse } from 'next/server';
import { getSheetData, updateSheetData, appendSheetData } from '@/lib/googleSheets';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const stocks = await getSheetData('Stock');
    return NextResponse.json({ success: true, data: stocks });
  } catch (error) {
    console.error('Error getting stocks:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data stock', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya Admin dan Super Admin yang dapat menambah stock' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { item_name, quantity } = body;

    if (!item_name || quantity === undefined) {
      return NextResponse.json(
        { error: 'item_name dan quantity harus diisi' },
        { status: 400 }
      );
    }

    const updated_at = new Date().toISOString();
    const stockData = [item_name, quantity, updated_at];

    await appendSheetData('Stock', stockData);

    return NextResponse.json({
      success: true,
      message: 'Stock berhasil ditambahkan',
      data: { item_name, quantity, updated_at }
    });

  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan stock', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya Admin dan Super Admin yang dapat mengupdate stock' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { item_name, quantity, rowIndex } = body;

    if (!rowIndex || quantity === undefined) {
      return NextResponse.json(
        { error: 'rowIndex dan quantity harus disertakan' },
        { status: 400 }
      );
    }

    const updated_at = new Date().toISOString();
    const stockData = [item_name, quantity, updated_at];

    await updateSheetData('Stock', rowIndex, stockData);

    return NextResponse.json({
      success: true,
      message: 'Stock berhasil diupdate',
      data: { item_name, quantity, updated_at }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate stock', details: error.message },
      { status: 500 }
    );
  }
}