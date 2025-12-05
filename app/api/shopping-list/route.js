import { NextResponse } from 'next/server';
import { appendSheetData, getSheetData } from '../../../lib/googleSheets.js';
import { getCurrentUser } from '../../../lib/auth.js';

export async function GET() {
  try {
    const shoppingList = await getSheetData('Shopping List');
    return NextResponse.json({ success: true, data: shoppingList });
  } catch (error) {
    console.error('Error getting shopping list:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data shopping list' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check permission
    const currentUser = await getCurrentUser();
    if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Hanya Admin dan Super Admin yang dapat menambah shopping list' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { shopping_id, item_shopping, category, quantity, unit, price } = body;

    if (!item_shopping || !category || !quantity || !unit || !price) {
      return NextResponse.json(
        { error: 'Semua field termasuk category harus diisi' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Karyawan', 'Bahan', 'Operasional'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Category tidak valid. Pilih: Karyawan, Bahan, atau Operasional' },
        { status: 400 }
      );
    }

    // Use provided shopping_id or generate new one
    const finalShoppingId = shopping_id || `RTN-SHOP-${Date.now().toString(36).toUpperCase()}`;
    const shopping_date = new Date().toISOString();

    const shoppingData = [
      finalShoppingId,
      shopping_date,
      item_shopping,
      category,
      quantity,
      unit,
      price
    ];

    await appendSheetData('Shopping List', shoppingData);

    return NextResponse.json({
      success: true,
      message: 'Shopping list berhasil ditambahkan',
      data: {
        shopping_id: finalShoppingId,
        shopping_date,
        item_shopping,
        category,
        quantity,
        unit,
        price
      }
    });

  } catch (error) {
    console.error('Error creating shopping list:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan shopping list' },
      { status: 500 }
    );
  }
}