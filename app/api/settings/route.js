// app/api/settings/route.js
import { NextResponse } from 'next/server';
import { getSheetData, updateSheetData, appendSheetData } from '@/lib/googleSheets';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await getSheetData('Settings');
    
    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          store_name: 'Ratuna',
          store_address: 'Jl. Babakan Cichaeum No.73\nRT 02 RW 21 Cimenyan, Kb.Bandung',
          store_phone: '088218639833',
          bill_header: 'Ratuna',
          bill_footer: 'Terimakasih Telah Berbelanja',
          logo_url: '/Logo_Ratuna.png'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings[0]
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil settings' },
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

    const body = await request.json();
    const { 
      store_name, 
      store_address, 
      store_phone, 
      bill_header, 
      bill_footer,
      logo_url 
    } = body;

    const settingsData = [
      store_name || 'Ratuna',
      store_address || '',
      store_phone || '',
      bill_header || 'Ratuna',
      bill_footer || 'Terimakasih Telah Berbelanja',
      logo_url || '/Logo_Ratuna.png',
      new Date().toISOString()
    ];

    // Check if settings exist
    const existingSettings = await getSheetData('Settings');
    
    if (existingSettings.length === 0) {
      // Create new settings
      await appendSheetData('Settings', settingsData);
    } else {
      // Update existing settings
      await updateSheetData('Settings', existingSettings[0]._rowIndex, settingsData);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings berhasil disimpan',
      data: {
        store_name,
        store_address,
        store_phone,
        bill_header,
        bill_footer,
        logo_url
      }
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan settings' },
      { status: 500 }
    );
  }
}