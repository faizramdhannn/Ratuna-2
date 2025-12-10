// components/SettingsTab.js
'use client';

import { useState, useEffect } from 'react';
import { Save, Store, FileText, Phone, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

export default function SettingsTab({ currentUser, onMessage }) {
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [settings, setSettings] = useState({
    storeName: 'Ratuna',
    storeAddress: 'Jl. Babakan Cichaeum No.73\nRT 02 RW 21 Cimenyan, Kb.Bandung',
    storePhone: '088218639833',
    billHeader: 'Ratuna',
    billFooter: 'Terimakasih Telah Berbelanja',
    logoUrl: '/Logo_Ratuna.png'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadingFetch(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          storeName: data.data.store_name || 'Ratuna',
          storeAddress: data.data.store_address || 'Jl. Babakan Cichaeum No.73\nRT 02 RW 21 Cimenyan, Kb.Bandung',
          storePhone: data.data.store_phone || '088218639833',
          billHeader: data.data.bill_header || 'Ratuna',
          billFooter: data.data.bill_footer || 'Terimakasih Telah Berbelanja',
          logoUrl: data.data.logo_url || '/Logo_Ratuna.png'
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
    setLoadingFetch(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: settings.storeName,
          store_address: settings.storeAddress,
          store_phone: settings.storePhone,
          bill_header: settings.billHeader,
          bill_footer: settings.billFooter,
          logo_url: settings.logoUrl
        })
      });

      const data = await res.json();

      if (data.success) {
        onMessage('success', 'Settings berhasil disimpan!');
      } else {
        onMessage('error', data.error || 'Gagal menyimpan settings');
      }
    } catch (error) {
      onMessage('error', 'Terjadi kesalahan saat menyimpan settings');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSettings({
      storeName: 'Ratuna',
      storeAddress: 'Jl. Babakan Cichaeum No.73\nRT 02 RW 21 Cimenyan, Kb.Bandung',
      storePhone: '088218639833',
      billHeader: 'Ratuna',
      billFooter: 'Terimakasih Telah Berbelanja',
      logoUrl: '/Logo_Ratuna.png'
    });
    onMessage('success', 'Settings direset ke default');
  };

  if (loadingFetch) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner-shopify w-12 h-12 mx-auto mb-4"></div>
          <p className="text-shopify-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>
            Kelola informasi toko dan tampilan bill
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Store Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-shopify-gray-800">
                <Store className="w-5 h-5 text-shopify-accent-primary" />
                <h3 className="font-semibold text-white">Informasi Toko</h3>
              </div>

              <Input
                label="Nama Toko"
                value={settings.storeName}
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                placeholder="Nama toko Anda"
              />

              <Textarea
                label="Alamat Toko"
                value={settings.storeAddress}
                onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                placeholder="Alamat lengkap toko"
                rows={4}
                helperText="Gunakan line break untuk baris baru"
              />

              <Input
                label="Nomor Telepon"
                value={settings.storePhone}
                onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                placeholder="Nomor telepon toko"
                icon={Phone}
              />
            </div>

            {/* Bill Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-shopify-gray-800">
                <FileText className="w-5 h-5 text-shopify-accent-primary" />
                <h3 className="font-semibold text-white">Pengaturan Bill</h3>
              </div>

              <Input
                label="Header Bill"
                value={settings.billHeader}
                onChange={(e) => setSettings({...settings, billHeader: e.target.value})}
                placeholder="Text yang muncul di header bill"
              />

              <Input
                label="Footer Bill"
                value={settings.billFooter}
                onChange={(e) => setSettings({...settings, billFooter: e.target.value})}
                placeholder="Text yang muncul di footer bill"
              />

              <Input
                label="Logo URL"
                value={settings.logoUrl}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                placeholder="/Logo_Ratuna.png"
                helperText="Path atau URL logo yang akan tampil di bill"
              />
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-shopify-gray-800">
                <MapPin className="w-5 h-5 text-shopify-accent-primary" />
                <h3 className="font-semibold text-white">Preview Bill</h3>
              </div>

              <div className="bg-shopify-darker p-6 rounded-shopify border border-shopify-gray-800">
                <div className="max-w-sm mx-auto bg-white text-black p-6 rounded-lg">
                  {/* Logo */}
                  <div className="text-center mb-4">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="h-16 mx-auto object-contain"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>

                  {/* Header */}
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">{settings.billHeader}</h2>
                    <p className="text-xs whitespace-pre-line mt-2">{settings.storeAddress}</p>
                    <p className="text-xs mt-1">Telp: {settings.storePhone}</p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-400 my-4"></div>

                  {/* Sample Content */}
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{new Date().toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{currentUser?.username}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-dashed border-gray-400 my-4"></div>

                  {/* Sample Items */}
                  <div className="text-xs mb-4">
                    <div className="font-bold mb-1">Sample Item</div>
                    <div className="flex justify-between">
                      <span>1 x Rp 10.000</span>
                      <span>Rp 10.000</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
                    <div className="flex justify-between font-bold">
                      <span>TOTAL</span>
                      <span>Rp 10.000</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-xs font-bold">
                    {settings.billFooter}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={handleReset}
                disabled={loading}
              >
                Reset to Default
              </Button>
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
                loading={loading}
                fullWidth
              >
                Simpan Pengaturan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}