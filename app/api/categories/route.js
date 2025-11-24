import { NextResponse } from 'next/server';
import { getSheetData, appendSheetData, deleteSheetRow } from '../../../lib/googleSheets.js';
import { getCurrentUser } from '../../../lib/auth.js';

export async function GET() {
  try {
    const categories = await getSheetData('Categories');
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { category_name } = await request.json();

    if (!category_name) {
      return NextResponse.json(
        { error: 'Category name harus diisi' },
        { status: 400 }
      );
    }

    await appendSheetData('Categories', [category_name]);

    return NextResponse.json({
      success: true,
      message: 'Category berhasil ditambahkan',
      data: { category_name }
    });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !['superadmin', 'admin'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rowIndex = searchParams.get('rowIndex');

    if (!rowIndex) {
      return NextResponse.json(
        { error: 'rowIndex harus disertakan' },
        { status: 400 }
      );
    }

    await deleteSheetRow('Categories', parseInt(rowIndex));

    return NextResponse.json({
      success: true,
      message: 'Category berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus category' },
      { status: 500 }
    );
  }
}