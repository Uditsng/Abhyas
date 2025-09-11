// app/invoice/[orderId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { getInvoice, getInvoiceTemplate } from '@/lib/invoiceService';
import { Spinner, Center, Text, Button } from '@chakra-ui/react';

export default function InvoicePage({ params }) {
  const {orderId }= params;

  const [invoice, setInvoice] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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

  return (
    <div className="bg-gray-100 min-h-screen p-8 pt-24" style={{ fontFamily: template.font }}>
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
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
            <p className="text-gray-500">#{invoice.orderId}</p>
            <p>
              <strong>Date:</strong>{' '}
              {new Date(invoice.date.seconds * 1000).toLocaleDateString()}
            </p>
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
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">{invoice.bundleInfo.title}</td>
              <td className="p-2 text-right">₹{invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-right">
          <p className="text-xl font-bold">Total: ₹{invoice.amount.toFixed(2)}</p>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>{template.footerNote}</p>
        </div>
        <Center mt={8}>
            <Button onClick={() => window.print()} colorScheme="blue">
                Print Invoice
            </Button>
        </Center>
      </div>
    </div>
  );
}