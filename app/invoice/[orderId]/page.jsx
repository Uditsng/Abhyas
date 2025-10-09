// app/invoice/[orderId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getInvoice, getInvoiceTemplate } from '@/lib/invoiceService';
import { Spinner, Center, Text, Button, Tag } from '@chakra-ui/react';

// function generateCustomInvoiceId(orderId, date) {
//   if (!orderId || !date) return '';
//   const invoiceDate = new Date(date.seconds * 1000);
//   const year = invoiceDate.getFullYear();
//   const month = String(invoiceDate.getMonth() + 1).padStart(2, '0'); // Ensures two digits, e.g., 09
//   const uniquePart = orderId.slice(-5).toUpperCase(); // Last 5 chars of orderId

//   return `WG-${year}/${month}-${uniquePart}`;
// }

export default function InvoicePage() {
  const params = useParams();
  const { orderId } = params;

  const [invoice, setInvoice] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!orderId) return;
      try {
        const [invoiceData, templateData] = await Promise.all([
          getInvoice(orderId),
          getInvoiceTemplate(),
        ]);
        setInvoice(invoiceData);
        setTemplate(templateData);
      } catch (error) {
        console.error('Error fetching invoice data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [orderId]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!invoice || !template) {
    return (
      <Center h="100vh">
        <Text>Invoice not found.</Text>
      </Center>
    );
  }

  const discount = invoice.disccount || 0;
  const taxAmount = invoice.taxAmount || 0;
  const totalAmount = invoice.amount || 0;
  const originalSubtotal = totalAmount - taxAmount + discount;
  
  const itemDetails = invoice.itemType === 'bundle'
    ? {
        type: 'Bundle',
        id: invoice.bundleId,
        title: invoice.bundleInfo?.title || 'Bundle Title',
      }
    : {
        type: 'Package',
        id: invoice.packageId,
        title: invoice.packageInfo?.name || 'Package Title',
      };

  // const customInvoiceId = generateCustomInvoiceId(invoice.orderId, invoice.date);

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-24" style={{ fontFamily: template.font }}>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 printable-area invoice-container">

        <div className="text-watermark">WG ABHYAS</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <img src={template.logoUrl} alt="Company Logo" className="h-16 mb-4" />
              <h1 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
                {template.companyName}
              </h1>
              <p>{template.address}</p>
              <p>{template.phone}</p>
              <p>{template.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold uppercase" style={{ color: template.primaryColor }}>
                Invoice
              </h2>
              {/* <p><strong>Invoice No:</strong> {customInvoiceId}</p> */}
              <p><strong>PaymentID: </strong>
              {invoice.invoiceId || invoice.orderId}</p>
              <p>
                <strong>order Date:</strong>{' '}
                {new Date(invoice.date.seconds * 1000).toLocaleDateString()}
              </p>
              <Tag size="lg" colorScheme="green" mt={2}>
                PAID
              </Tag>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold border-b-2 pb-2 mb-2" style={{ borderColor: template.primaryColor }}>
              Bill To:
            </h3>
            <p>{invoice.userInfo.name}</p>
            <p>{invoice.userInfo.email}</p>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}>
                <th className="p-3 text-left font-semibold">Description</th>
                <th className="p-3 text-left font-semibold">Product ID</th>
                <th className="p-3 text-right font-semibold">Quantity</th>
                <th className="p-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">
                  {itemDetails.title}
                  <span className="text-gray-500 text-sm block">({itemDetails.type})</span>
                </td>
                <td className="p-3 text-left font-mono text-sm">{itemDetails.id}</td>
                <td className="p-3 text-right">1</td>
                <td className="p-3 text-right">₹{originalSubtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-8">
            <div className="w-full sm:w-1/2 md:w-2/5 space-y-2">
              <div className="flex justify-between">
                <p>Subtotal:</p>
                <p>₹{originalSubtotal.toFixed(2)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <p>Discount ({invoice.couponCode}):</p>
                  <p>- ₹{discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p>Tax (GST):</p>
                <p>+ ₹{taxAmount.toFixed(2)}</p>
              </div>
              <div
                className="flex justify-between font-bold text-xl mt-2 border-t-2 pt-2"
                style={{ borderColor: template.primaryColor, color: template.primaryColor }}
              >
                <p>Total Paid:</p>
                <p>₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-gray-500 text-sm">
             <h4 className="font-bold mb-2">Notes & Terms</h4>
             <p>{template.footerNote}</p>
             <p>Thank you for your business!</p>
          </div>

          <Center mt={8} className="no-print">
            <Button onClick={() => window.print()} colorScheme="blue">
              Print Invoice
            </Button>
          </Center>
        </div>
      </div>
    </div>
  );
}