// app/invoice/[orderId]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getInvoice, getInvoiceTemplate } from "@/lib/invoiceService";
import { Spinner, Center, Text, Button, Tag } from "@chakra-ui/react";

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
        console.error("Error fetching invoice data:", error);
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

  const itemDetails =
    invoice.itemType === "bundle"
      ? {
          type: "Bundle",
          id: invoice.bundleId,
          title: invoice.bundleInfo?.title || "Bundle Title",
        }
      : {
          type: "Package",
          id: invoice.packageId,
          title: invoice.packageInfo?.name || "Package Title",
        };

  return (
    <div
      className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 md:p-8 lg:p-24 pt-24"
      style={{ fontFamily: template.font }}
    >
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 md:p-8 printable-area invoice-container">

        {template.watermarkText && (
          <div className="watermark-grid-container" aria-hidden="true">
            {Array(15)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="text-watermark-item">
                  {template.watermarkText}
                </div>
              ))}
          </div>
        )}

        {/* Content with z-index to ensure it's above watermark */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">

            <img
              src={template.logoUrl}
              alt="Company Logo"
              className="h-16 mb-4"
            />
            <h1
              className="text-2xl font-bold"
              style={{ color: template.primaryColor }}
            >
              {template.companyName}
            </h1>

            <div className="text-left sm:text-right w-full sm:w-auto">
              <h2
                className="text-3xl font-bold uppercase tracking-wider"
                style={{ color: template.primaryColor }}
              >
                Invoice
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                <strong>PaymentID: </strong>
                {invoice.invoiceId || invoice.orderId}
              </p>
              <p className="text-sm">
                <strong>order Date:</strong>{" "}
                {new Date(invoice.date.seconds * 1000).toLocaleDateString(
                  "en-GB"
                )}
              </p>
              <Tag size="md" colorScheme="green" mt={2} variant="solid">
                PAID
              </Tag>
            </div>
          </div>

          <div className="w-full sm:w-1/2">

            {/* <img
              src={template.logoUrl}
              alt="Company Logo"
              className="h-16 mb-4"
            />
            <h1
              className="text-2xl font-bold"
              style={{ color: template.primaryColor }}
            >
              {template.companyName}
            </h1> */}

            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {template.address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {template.phone}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {template.email}
            </p>
            {template.gstNumber && (
              <p className="text-sm mt-1">
                <strong>GSTIN:</strong> {template.gstNumber}
              </p>
            )}
          </div>

          <div className="mb-8">
            <h3
              className="font-bold border-b-2 pb-1 mb-2 text-gray-600 dark:text-gray-300"
              style={{ borderColor: template.primaryColor }}
            >
              Bill To:
            </h3>
            <p className="font-semibold">{invoice.userInfo.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {invoice.userInfo.email}
            </p>
          </div>
<div className="overflow-x-auto">
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: template.secondaryColor,
                  color: template.primaryColor,
                }}
              >
                <th className="p-3 text-left font-semibold rounded-l-lg">Description</th>
                <th className="p-3 text-left font-semibold">Product ID</th>
                <th className="p-3 text-right font-semibold">Quantity</th>
                <th className="p-3 text-right font-semibold rounded-l-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="p-3">
                  {itemDetails.title}
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">
                    ({itemDetails.type})
                  </span>
                </td>
                <td className="p-3 text-left font-mono text-xs">
                  {itemDetails.id}
                </td>
                <td className="p-3 text-right">1</td>
                <td className="p-3 text-right font-medium">
                  ₹{originalSubtotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <p>₹{originalSubtotal.toFixed(2)}</p>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-500">
                  <p>Discount ({invoice.couponCode}):</p>
                  <p>- ₹{discount.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <p>Tax (GST):</p>
                <p>+ ₹{taxAmount.toFixed(2)}</p>
              </div>
              <div
                className="flex justify-between font-bold text-xl mt-2 border-t-2 pt-2"
                style={{
                  borderColor: template.primaryColor,
                  color: template.primaryColor,
                }}
              >
                <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
                <div
                  className="flex justify-between items-center text-lg font-bold"
                  style={{ color: template.primaryColor }}
                >
                  <span className="px-3">Total Paid</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-xs">
            <p>{template.footerNote}</p>
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
