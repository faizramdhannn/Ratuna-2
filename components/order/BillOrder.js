// components/order/BillOrder.js
'use client';

import { forwardRef, useState, useEffect } from 'react';

const BillOrder = forwardRef(({ orderData, items }, ref) => {
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
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;
  };

  return (
    <div ref={ref} className="bill-container" id="bill-print-area">
      {/* Logo */}
      <div className="bill-logo">
        <img 
          src={settings.logoUrl} 
          alt={`${settings.storeName} Logo`}
          className="logo-img"
          style={{ display: 'block', margin: '0 auto' }}
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Store Info */}
      <div className="bill-header">
        <h1 className="store-name">{settings.billHeader}</h1>
        <p className="store-address">
          {settings.storeAddress.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < settings.storeAddress.split('\n').length - 1 && <br />}
            </span>
          ))}
          <br />
          Telp: {settings.storePhone}
        </p>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Order Info */}
      <div className="bill-info">
        <table className="info-table">
          <tbody>
            <tr>
              <td className="info-label">Tanggal:</td>
              <td className="info-value">{formatDate(orderData.created_at)}</td>
            </tr>
            <tr>
              <td className="info-label">Kasir:</td>
              <td className="info-value">{orderData.cashier_name}</td>
            </tr>
            <tr>
              <td className="info-label">No:</td>
              <td className="info-value">{orderData.order_id}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Items */}
      <div className="bill-items">
        {items.map((item, index) => (
          <div key={index} className="item-row">
            <div className="item-name">{item.item_name}</div>
            <table className="item-table">
              <tbody>
                <tr>
                  <td className="item-qty">{item.quantity} x Rp {parseInt(item.price).toLocaleString('id-ID')}</td>
                  <td className="item-subtotal">Rp {parseInt(item.subtotal).toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Notes if exists */}
      {orderData.notes && (
        <>
          <div className="divider"></div>
          <div className="bill-notes">
            <strong>Notes:</strong> {orderData.notes}
          </div>
        </>
      )}

      {/* Divider */}
      <div className="divider"></div>

      {/* Total */}
      <div className="bill-total">
        <table className="total-table">
          <tbody>
            <tr>
              <td>Total QTY</td>
              <td className="text-right">{items.reduce((sum, item) => sum + parseInt(item.quantity), 0)}</td>
            </tr>
            <tr>
              <td>Sub Total</td>
              <td className="text-right">Rp {parseInt(orderData.total_amount).toLocaleString('id-ID')}</td>
            </tr>
            <tr className="total-main-row">
              <td>TOTAL</td>
              <td className="text-right">Rp {parseInt(orderData.total_amount).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Bayar ({orderData.payment_method})</td>
              <td className="text-right">Rp {parseInt(orderData.payment_method === 'QRIS' ? orderData.total_amount : orderData.cash_paid).toLocaleString('id-ID')}</td>
            </tr>
            <tr>
              <td>Kembali</td>
              <td className="text-right">Rp {parseInt(orderData.change || 0).toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <div className="divider"></div>

      {/* Footer */}
      <div className="bill-footer">
        <p>{settings.billFooter}</p>
      </div>

      {/* CSS untuk Print */}
      <style jsx>{`
        /* Screen View */
        .bill-container {
          background: white;
          padding: 16px;
          max-width: 400px;
          margin: 0 auto;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
        }

        .bill-logo {
          text-align: center;
          margin-bottom: 12px;
        }

        .logo-img {
          height: 60px;
          object-fit: contain;
        }

        .bill-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .store-name {
          font-size: 20px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .store-address {
          font-size: 11px;
          line-height: 1.5;
          margin: 0;
          color: #333;
        }

        .divider {
          border-top: 1px dashed #000;
          margin: 12px 0;
        }

        .bill-info {
          margin-bottom: 12px;
        }

        .info-table {
          width: 100%;
          border-collapse: collapse;
        }

        .info-table td {
          padding: 3px 0;
          font-size: 11px;
        }

        .info-label {
          width: 80px;
          font-weight: 600;
        }

        .info-value {
          text-align: left;
        }

        .bill-items {
          margin-bottom: 12px;
        }

        .item-row {
          margin-bottom: 10px;
        }

        .item-name {
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .item-table {
          width: 100%;
          border-collapse: collapse;
        }

        .item-table td {
          padding: 2px 0;
          font-size: 11px;
        }

        .item-qty {
          text-align: left;
        }

        .item-subtotal {
          text-align: right;
          font-weight: 600;
        }

        .bill-notes {
          font-size: 11px;
          padding: 8px;
          background: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .bill-total {
          margin-bottom: 12px;
        }

        .total-table {
          width: 100%;
          border-collapse: collapse;
        }

        .total-table td {
          padding: 4px 0;
          font-size: 11px;
        }

        .total-table .text-right {
          text-align: right;
          font-weight: 600;
        }

        .total-main-row td {
          font-size: 14px;
          font-weight: bold;
          padding: 8px 0;
        }

        .bill-footer {
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          margin-top: 12px;
        }

        .bill-footer p {
          margin: 0;
        }

        /* Print Styles untuk Thermal Printer 58mm */
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .bill-container {
            width: 58mm !important;
            max-width: 58mm !important;
            padding: 3mm !important;
            margin: 0 !important;
            font-size: 9pt !important;
            position: relative !important;
          }

          .logo-img {
            height: 35px !important;
            max-width: 50mm !important;
          }

          .store-name {
            font-size: 13pt !important;
            margin-bottom: 2mm !important;
          }

          .store-address {
            font-size: 8pt !important;
            line-height: 1.3 !important;
          }

          .divider {
            margin: 2mm 0 !important;
            border-top-width: 1px !important;
          }

          .info-table td,
          .item-table td,
          .total-table td {
            font-size: 8pt !important;
            padding: 1mm 0 !important;
          }

          .info-label {
            width: 20mm !important;
          }

          .item-name {
            font-size: 9pt !important;
            margin-bottom: 1mm !important;
          }

          .bill-notes {
            font-size: 8pt !important;
            padding: 2mm !important;
          }

          .total-main-row td {
            font-size: 11pt !important;
            padding: 2mm 0 !important;
          }

          .bill-footer {
            font-size: 9pt !important;
            margin-top: 3mm !important;
          }
        }
      `}</style>
    </div>
  );
});

BillOrder.displayName = 'BillOrder';

export default BillOrder;