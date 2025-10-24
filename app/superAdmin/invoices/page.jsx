// //app/superAdmin/invoices/page.jsx
// 'use client';

// import { useState, useEffect, useMemo, useRef } from 'react';
// import {
//   getAllInvoices,
//   getInvoiceTemplate,
//   updateInvoiceTemplate,
// } from '@/lib/invoiceService';
// import Link from 'next/link';
// import { ChevronDown, ChevronUp, Search, Printer, RotateCcw, Eye } from 'lucide-react';
// import {
//     Modal,
//     ModalOverlay,
//     ModalContent,
//     ModalHeader,
//     ModalFooter,
//     ModalBody,
//     ModalCloseButton,
//     Button,
//     useDisclosure,
// } from '@chakra-ui/react';


// // --- Reusable Components ---

// const Spinner = () => (
//   <div className="flex justify-center items-center h-64">
//     <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//   </div>
// );

// const Toast = ({ message, show }) => (
//   <div
//     className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl bg-green-600 text-white transition-all duration-300 ease-in-out z-50 ${
//       show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
//     }`}
//   >
//     {message}
//   </div>
// );

// //Main Page Component 

// export default function SuperAdminInvoicesPage() {
//     const [tab, setTab] = useState('list'); 

//     return (
//         <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
//             <div className="max-w-7xl mx-auto">
//                  <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
//                     Invoice Management
//                 </h1>
//                 <div className="border-b border-gray-200 dark:border-gray-700">
//                     <nav className="-mb-px flex space-x-6" aria-label="Tabs">
//                         <button
//                             onClick={() => setTab('list')}
//                             className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
//                                 tab === 'list'
//                                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
//                             }`}
//                         >
//                             Invoices List
//                         </button>
//                         <button
//                             onClick={() => setTab('template')}
//                             className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
//                                 tab === 'template'
//                                     ? 'border-blue-500 text-blue-600 dark:text-blue-400'
//                                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
//                             }`}
//                         >
//                             Template Editor
//                         </button>
//                     </nav>
//                 </div>
//                 <div className="pt-8">
//                     {tab === 'list' && <InvoicesList />}
//                     {tab === 'template' && <TemplateEditor />}
//                 </div>
//             </div>
//         </div>
//     );
// }


// //Invoices List Component 

// function InvoicesList() {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   useEffect(() => {
//     async function fetchInvoices() {
//       try {
//         const allInvoices = await getAllInvoices();
//         setInvoices(allInvoices);
//       } catch (error) {
//         console.error("Failed to fetch invoices:", error);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchInvoices();
//   }, []);

//   const sortedAndFilteredInvoices = useMemo(() => {
//     let filtered = invoices.filter(
//       (invoice) =>
//         invoice.userInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         invoice.bundleInfo.title.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     return filtered.sort((a, b) => {
//         let aValue = a[sortConfig.key];
//         let bValue = b[sortConfig.key];

//         if (sortConfig.key === 'date') {
//             aValue = a.date.seconds;
//             bValue = b.date.seconds;
//         }

//         if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//         if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//         return 0;
//     });
//   }, [invoices, searchTerm, sortConfig]);

//   const totalPages = Math.ceil(sortedAndFilteredInvoices.length / itemsPerPage);
//   const paginatedInvoices = sortedAndFilteredInvoices.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const requestSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   if (loading) return <Spinner />;

//   return (
//     <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
//         <div className="p-4 sm:p-6">
//             <div className="relative w-full md:w-1/2 lg:w-1/3">
//                 <input
//                     type="text"
//                     placeholder="Search by student or bundle..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300"/>
//             </div>
//         </div>
//         <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//             <thead className="bg-gray-50 dark:bg-slate-800">
//                 <tr>
//                     {['Order ID', 'Student Name', 'Bundle Name'].map(header => (
//                         <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
//                     ))}
//                     <th onClick={() => requestSort('amount')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700">
//                         <div className="flex items-center gap-1.5">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
//                     </th>
//                     <th onClick={() => requestSort('date')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700">
//                         <div className="flex items-center gap-1.5">Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
//                 </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-slate-900/50 divide-y divide-gray-200 dark:divide-gray-700">
//                 {paginatedInvoices.map((invoice) => (
//                 <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{invoice.paymentID}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.userInfo.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">{(invoice.bundleInfo)?.title || (invoice.packageInfo)?.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{invoice.amount.toFixed(2)}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(invoice.date.seconds * 1000).toLocaleDateString('en-GB')}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                     <Link href={`/invoice/${invoice.id}`}>
//                         <button className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-all">View</button>
//                     </Link>
//                     </td>
//                 </tr>
//                 ))}
//             </tbody>
//             </table>
//         </div>
//         {totalPages > 1 && (
//             <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
//                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700">Prev</button>
//                 <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
//                 <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700">Next</button>
//             </div>
//         )}
//     </div>
//   );
// }

// //Template Editor Component

// function TemplateEditor() {
//     const [template, setTemplate] = useState({});
//     const [initialTemplate, setInitialTemplate] = useState({});
//     const [latestInvoice, setLatestInvoice] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [isSaving, setIsSaving] = useState(false);
//     const [toast, setToast] = useState({ show: false, message: '' });
    
//     const previewRef = useRef(null);
//     const { isOpen, onOpen, onClose } = useDisclosure();
//     const defaultTemplate = {
//         companyName: 'Abhyas Mock Test Pvt. Ltd.',
//         logoUrl: 'https://placehold.co/200x80/3b82f6/white?text=Abhyas',
//         address: 'Gorakhpur, Uttar Pradesh, India',
//         phone: '+91-1234567890',
//         email: 'support@abhyas.com',
//         gstNumber: '27ABCDE1234F1Z5',
//         primaryColor: '#3b82f6',
//         secondaryColor: '#f3f4f6',
//         font: 'Inter',
//         footerNote: 'This is a system-generated invoice. No signature required.',
//     };

//     useEffect(() => {
//         async function fetchData() {
//             try {
//                 const templateData = await getInvoiceTemplate();
//                 const finalTemplate = Object.keys(templateData).length ? templateData : defaultTemplate;
//                 setTemplate(finalTemplate);
//                 setInitialTemplate(finalTemplate);
//                 setLatestInvoice({
//                     orderId: 'SAMPLE-123',
//                     amount: 499,
//                     date: { seconds: Math.floor(Date.now() / 1000) },
//                     userInfo: { name: 'Udit singh', email: 'udityrr@example.com' },
//                     bundleInfo: { title: 'SSC CGL Tier 1 Mock Series' }
//                 });
//             } catch (error) {
//                 console.error("Failed to fetch data:", error);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchData();
//     }, []);

//     const handleSave = async () => {
//         setIsSaving(true);
//         await updateInvoiceTemplate(template);
//         setInitialTemplate(template);
//         setIsSaving(false);
//         setToast({ show: true, message: 'Template saved successfully!' });
//         setTimeout(() => setToast({ show: false, message: '' }), 3000);
//     };

//     const handleReset = () => {
//         setTemplate(defaultTemplate);
//     }

//     const handlePrint = () => {
//         const printContent = previewRef.current.innerHTML;
//         const printWindow = window.open('', '', 'height=800,width=800');
//         printWindow.document.write('<html><head><title>Print Invoice</title>');
//         printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // Tailwind for print
//         printWindow.document.write(`<style> @media print { body { -webkit-print-color-adjust: exact; } .print-hidden { display: none; } } </style>`);
//         printWindow.document.write(`<style> @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap'); </style>`);
//         printWindow.document.write(`<body style="font-family: '${template.font}', sans-serif;">`);
//         printWindow.document.write(printContent);
//         printWindow.document.write('</body></html>');
//         printWindow.document.close();
        
//         // Use a timeout to ensure styles are loaded before printing
//         setTimeout(() => {
//             printWindow.print();
//         }, 500);
//     }
    
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setTemplate((prev) => ({ ...prev, [name]: value }));
//     };

//     const isDirty = useMemo(() => JSON.stringify(template) !== JSON.stringify(initialTemplate), [template, initialTemplate]);

//     if (loading) return <Spinner />;

//     const renderInput = (label, name, type = 'text', props = {}) => (
//         <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
//             <input name={name} value={template[name] || ''} type={type} onChange={handleChange} {...props}
//                 className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//         </div>
//     );
    
//     return (
//         <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
//                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">
//                     Customize Invoice Template
//                 </h2>
//                 <Button onClick={onOpen} colorScheme='blue' leftIcon={<Eye size={16}/>}>
//                     Live Preview
//                 </Button>
//             </div>
            
//             <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {renderInput('Company Name', 'companyName')}
//                     {renderInput('GST Number', 'gstNumber')}
//                 </div>
//                 {renderInput('Logo URL', 'logoUrl')}
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
//                     <textarea name="address" value={template.address || ''} onChange={handleChange} rows="2"
//                         className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {renderInput('Phone', 'phone')}
//                     {renderInput('Email', 'email', 'email')}
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font</label>
//                         <select name="font" value={template.font} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
//                             {['Inter', 'Roboto', 'Poppins', 'Lato', 'Montserrat'].map(font => <option key={font}>{font}</option>)}
//                         </select>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                         <div className="flex flex-col">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
//                             <input name="primaryColor" type="color" value={template.primaryColor} onChange={handleChange} className="w-full h-11 p-1 rounded-lg border border-gray-300 dark:border-gray-600"/>
//                         </div>
//                         <div className="flex flex-col">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
//                             <input name="secondaryColor" type="color" value={template.secondaryColor} onChange={handleChange} className="w-full h-11 p-1 rounded-lg border border-gray-300 dark:border-gray-600"/>
//                         </div>
//                     </div>
//                 </div>
//                 {renderInput('Footer Note', 'footerNote')}
//                 <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
//                     <button onClick={handleReset} className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
//                         <RotateCcw size={16}/> Reset to Default
//                     </button>
//                     <button className="w-full sm:w-auto px-6 py-2.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors" onClick={handleSave} disabled={isSaving || !isDirty}>
//                         {isSaving ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </div>

//             {/* --- Chakra UI Modal for Live Preview --- */}
//             <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
//                 <ModalOverlay bg='blackAlpha.600' backdropFilter='blur(5px)' />
//                 <ModalContent className="bg-gray-50 dark:bg-gray-900 mx-4">
//                     <ModalHeader className="font-bold text-gray-900 dark:text-gray-100">Invoice Preview</ModalHeader>
//                     <ModalCloseButton />
//                     <ModalBody>
//                         <div className="bg-gray-200 dark:bg-black p-2 sm:p-4 rounded-lg">
//                            <div ref={previewRef}>
//                                 <InvoicePreview template={template} invoice={latestInvoice} />
//                            </div>
//                         </div>
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button variant='ghost' mr={3} onClick={onClose}>
//                             Close
//                         </Button>
//                         <Button colorScheme='blue' onClick={handlePrint} leftIcon={<Printer size={16}/>}>
//                             Export / Print
//                         </Button>
//                     </ModalFooter>
//                 </ModalContent>
//             </Modal>
            
//             <Toast message={toast.message} show={toast.show} />
//         </div>
//     );
// }

// // --- Invoice Preview Component ---
// function InvoicePreview({ template, invoice }) {
//     if (!invoice || !template) return null;
//     const invoiceDate = invoice.date?.seconds ? new Date(invoice.date.seconds * 1000).toLocaleDateString('en-GB') : 'N/A';
    
//     // * Dynamically import fonts for the preview
//     const fontUrl = `https://fonts.googleapis.com/css2?family=${template.font.replace(' ', '+')}:wght@400;500;700&display=swap`;
    
//     // * Define pricing variables for clarity in the preview
//     const actualPrice = invoice.bundlePrice || 0;
//     const taxAmount = invoice.taxAmount || 0;
//     const discount = invoice.discount || 0; // * Placeholder for discount
//     const paidAmount = invoice.amount || 0;
//     const gstRate = actualPrice > 0 ? ((taxAmount / actualPrice) * 100).toFixed(0) : 0; // * Calculate GST rate

//     return (
//         <>
//             <style>{`@import url('${fontUrl}');`}</style>
//             <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8 text-gray-800 dark:text-gray-200 max-w-4xl mx-auto" style={{ fontFamily: `'${template.font}', sans-serif` }}>
//                 <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
//                     <div className="mb-6 sm:mb-0">
//                         {template.logoUrl && <img src={template.logoUrl} alt="Company Logo" className="h-16 mb-4 object-contain" onError={(e) => e.target.style.display='none'}/>}
//                         <h1 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
//                             {template.companyName}
//                         </h1>
//                         <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{template.address}</p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">{template.phone}</p>
//                         <p className="text-sm text-gray-600 dark:text-gray-400">{template.email}</p>
//                         {template.gstNumber && <p className="text-sm mt-1"><strong>GSTIN:</strong> {template.gstNumber}</p>}
//                     </div>
//                     <div className="text-left sm:text-right w-full sm:w-auto">
//                         <h2 className="text-3xl font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
//                             Invoice
//                         </h2>
//                         <p className="text-gray-500 dark:text-gray-400 font-mono">#{invoice.orderId}</p>
//                         {/* * Display Payment ID in preview */}
//                         <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">Payment ID: {invoice.paymentID || 'pay_xxxxxxxxxxxxxx'}</p>
//                         <p><strong>Date:</strong> {invoiceDate}</p>
//                     </div>
//                 </div>

//                 <div className="mb-8">
//                     <h3 className="font-bold border-b-2 pb-2 mb-3 text-gray-600 dark:text-gray-300" style={{ borderColor: template.primaryColor }}>
//                         Bill To:
//                     </h3>
//                     <p className="font-semibold">{invoice.userInfo.name}</p>
//                     <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.userInfo.email}</p>
//                 </div>

//                 <table className="w-full mb-8">
//                     <thead>
//                         <tr style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}>
//                             <th className="p-3 text-left font-semibold rounded-l-lg">Description</th>
//                             <th className="p-3 text-right font-semibold rounded-r-lg">Amount</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
//                         <tr>
//                             <td className="p-3">{invoice.bundleInfo.title}</td>
//                             {/* * Use actualPrice in the table */}
//                             <td className="p-3 text-right font-medium">₹{actualPrice.toFixed(2)}</td>
//                         </tr>
//                     </tbody>
//                 </table>

//                 {/* * New detailed pricing section for preview */}
//                 <div className="flex justify-end mt-4">
//                     <div className="w-full max-w-xs space-y-2">
//                          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
//                             <span>Actual Price</span>
//                             <span>₹{actualPrice.toFixed(2)}</span>
//                         </div>
//                         <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
//                             <span>Tax (GST @{gstRate}%)</span>
//                             <span>+ ₹{taxAmount.toFixed(2)}</span>
//                         </div>
//                         {discount > 0 &&
//                             <div className="flex justify-between text-sm text-red-500">
//                                 <span>Discount</span>
//                                 <span>- ₹{discount.toFixed(2)}</span>
//                             </div>
//                         }
//                         <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
//                         <div className="flex justify-between items-center text-lg font-bold" style={{ color: template.primaryColor }}>
//                             <span>Total Paid</span>
//                             <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{paidAmount.toFixed(2)}</span>
//                         </div>
//                     </div>
//                 </div>
                
//                 <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-xs">
//                     <p>{template.footerNote}</p>
//                 </div>
//             </div>
//         </>
//     )
// }


'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  getAllInvoices,
  getInvoiceTemplate,
  updateInvoiceTemplate,
} from '@/lib/invoiceService';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search, Printer, RotateCcw, Eye } from 'lucide-react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
} from '@chakra-ui/react';

const Spinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Toast = ({ message, show }) => (
  <div
    className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-xl bg-green-600 text-white transition-all duration-300 ease-in-out z-50 ${
      show ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'
    }`}
  >
    {message}
  </div>
);

//Main Page Component

export default function SuperAdminInvoicesPage() {
    const [tab, setTab] = useState('list'); 

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
            <div className="max-w-7xl mx-auto">
                 <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
                    Invoice Management
                </h1>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setTab('list')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                                tab === 'list'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                            }`}
                        >
                            Invoices List
                        </button>
                        <button
                            onClick={() => setTab('template')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                                tab === 'template'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                            }`}
                        >
                            Template Editor
                        </button>
                    </nav>
                </div>
                <div className="pt-8">
                    {tab === 'list' && <InvoicesList />}
                    {tab === 'template' && <TemplateEditor />}
                </div>
            </div>
        </div>
    );
}


//Invoices List Component

function InvoicesList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const allInvoices = await getAllInvoices();
        setInvoices(allInvoices);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const sortedAndFilteredInvoices = useMemo(() => {
    let filtered = invoices.filter(
      (invoice) =>
        invoice.userInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (invoice.bundleInfo || invoice.packageInfo)?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'date' && a.date?.seconds && b.date?.seconds) { 
            aValue = a.date.seconds;
            bValue = b.date.seconds;
        } else if (sortConfig.key === 'amount') {
           aValue = a.amount || 0;
           bValue = b.amount || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [invoices, searchTerm, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedAndFilteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <Spinner />;

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6">
            <div className="relative w-full md:w-1/2 lg:w-1/3">
                <input
                    type="text"
                    placeholder="Search by student or bundle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-300"/>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                    {['Order ID', 'Student Name', 'Item Name'].map(header => ( 
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>
                    ))}
                    <th onClick={() => requestSort('amount')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700">
                        <div className="flex items-center gap-1.5">Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
                    </th>
                    <th onClick={() => requestSort('date')} className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-slate-700">
                        <div className="flex items-center gap-1.5">Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}</div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900/50 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{invoice.paymentID || invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.userInfo?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{(invoice.bundleInfo || invoice.packageInfo)?.title || invoice.packageInfo?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{(invoice.amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.date?.seconds ? new Date(invoice.date.seconds * 1000).toLocaleDateString('en-GB') : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link href={`/invoice/${invoice.id}`}>
                        <button className="px-3 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-all">View</button>
                    </Link>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {totalPages > 1 && (
            <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700">Prev</button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700">Next</button>
            </div>
        )}
    </div>
  );
}

//Template Editor Component

function TemplateEditor() {
    const [template, setTemplate] = useState({});
    const [initialTemplate, setInitialTemplate] = useState({});
    const [latestInvoice, setLatestInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    const previewRef = useRef(null);
    const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI hook for modal

    const defaultTemplate = {
        companyName: 'Abhyas Mock Test Pvt. Ltd.',
        logoUrl: 'https://res.cloudinary.com/dmd3rmar4/image/upload/v1759559834/apple-touch-icon_vodzgk.png', 
        address: 'Gorakhpur, Uttar Pradesh, India',
        phone: '+91-1234567890',
        email: 'support@abhyas.com',
        gstNumber: '27ABCDE1234F1Z5',
        primaryColor: '#3b82f6',
        secondaryColor: '#f3f4f6',
        font: 'Inter',
        footerNote: 'This is a system-generated invoice. No signature required.',
        watermarkText: 'WG ABHYAS', 
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const templateData = await getInvoiceTemplate();
                setTemplate(templateData);
                setInitialTemplate(templateData); 

                // Use a generic sample invoice for preview
                setLatestInvoice({
                    orderId: 'SAMPLE-123',
                    amount: 499,
                    date: { seconds: Math.floor(Date.now() / 1000) },
                    userInfo: { name: 'Sample User', email: 'sample@example.com' },
                    bundleInfo: { title: 'Sample Bundle Test Series' },
                    paymentID: 'pay_sample12345',
                    bundlePrice: 422.88, 
                    taxAmount: 76.12 
                });
            } catch (error) {
                console.error("Failed to fetch template:", error);
                setTemplate(defaultTemplate);
                setInitialTemplate(defaultTemplate);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []); 

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateInvoiceTemplate(template);
            setInitialTemplate(template); 
            setToast({ show: true, message: 'Template saved successfully!' });
            setTimeout(() => setToast({ show: false, message: '' }), 3000);
        } catch (error) {
             console.error("Failed to save template:", error);
             setToast({ show: true, message: 'Failed to save template!' }); 
             setTimeout(() => setToast({ show: false, message: '' }), 3000);
        } finally {
             setIsSaving(false);
        }
    };

    const handleReset = () => {
        setTemplate(defaultTemplate); // Reset to the hardcoded default
    }

    const handlePrint = () => {
        const printContent = previewRef.current.innerHTML;
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print Invoice</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // Tailwind for print
        printWindow.document.write(`<style> @media print { body { -webkit-print-color-adjust: exact; } .print-hidden { display: none; } } </style>`);
        printWindow.document.write(`<style> @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;700&family=Poppins:wght@400;500;700&family=Roboto:wght@400;500;700&display=swap'); </style>`);
        printWindow.document.write(`<body style="font-family: '${template.font}', sans-serif;">`);
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Use a timeout to ensure styles are loaded before printing
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTemplate((prev) => ({ ...prev, [name]: value }));
    };

    // Check if template has changed from initial state
    const isDirty = useMemo(() => JSON.stringify(template) !== JSON.stringify(initialTemplate), [template, initialTemplate]);

    if (loading) return <Spinner />;

    // Helper to render input fields
    const renderInput = (label, name, type = 'text', props = {}) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input name={name} value={template[name] || ''} type={type} onChange={handleChange} {...props}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 sm:p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                 <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 sm:mb-0">
                    Customize Invoice Template
                </h2>
                <Button onClick={onOpen} colorScheme='blue' leftIcon={<Eye size={16}/>}>
                    Live Preview
                </Button>
            </div>

            <div className="space-y-6">
                {/* Existing fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput('Company Name', 'companyName')}
                    {renderInput('GST Number', 'gstNumber')}
                </div>
                {renderInput('Logo URL', 'logoUrl')}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea name="address" value={template.address || ''} onChange={handleChange} rows="2"
                        className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInput('Phone', 'phone')}
                    {renderInput('Email', 'email', 'email')}
                </div>

                {renderInput('Watermark Text', 'watermarkText', 'text', {placeholder: 'e.g., WG ABHYAS'})}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    {/* Font Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font</label>
                        <select name="font" value={template.font || 'Inter'} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {['Inter', 'Roboto', 'Poppins', 'Lato', 'Montserrat'].map(font => <option key={font}>{font}</option>)}
                        </select>
                    </div>
                    {/* Color Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                            <input name="primaryColor" type="color" value={template.primaryColor || '#000000'} onChange={handleChange} className="w-full h-11 p-1 rounded-lg border border-gray-300 dark:border-gray-600"/>
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                            <input name="secondaryColor" type="color" value={template.secondaryColor || '#ffffff'} onChange={handleChange} className="w-full h-11 p-1 rounded-lg border border-gray-300 dark:border-gray-600"/>
                        </div>
                    </div>
                </div>
                {renderInput('Footer Note', 'footerNote')}

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button onClick={handleReset} className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                        <RotateCcw size={16}/> Reset to Default
                    </button>
                    <button className="w-full sm:w-auto px-6 py-2.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors" onClick={handleSave} disabled={isSaving || !isDirty}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/*Chakra UI Modal for Live Preview */}
            <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
                <ModalOverlay bg='blackAlpha.600' backdropFilter='blur(5px)' />
                <ModalContent className="bg-gray-50 dark:bg-gray-900 mx-4">
                    <ModalHeader className="font-bold text-gray-900 dark:text-gray-100">Invoice Preview</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <div className="bg-gray-200 dark:bg-black p-2 sm:p-4 rounded-lg">
                           <div ref={previewRef} className="invoice-container printable-area"> 
                                <div className="text-watermark">{template.watermarkText}</div>
                                <InvoicePreview template={template} invoice={latestInvoice} />
                           </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='ghost' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button colorScheme='blue' onClick={handlePrint} leftIcon={<Printer size={16}/>}>
                            Export / Print
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Toast message={toast.message} show={toast.show} />
        </div>
    );
}

//Invoice Preview Component

function InvoicePreview({ template, invoice }) {

     if (!invoice || !template) return null;
    const invoiceDate = invoice.date?.seconds ? new Date(invoice.date.seconds * 1000).toLocaleDateString('en-GB') : 'N/A';
    const fontUrl = `https://fonts.googleapis.com/css2?family=${(template.font || 'Inter').replace(' ', '+')}:wght@400;500;700&display=swap`;

    const actualPrice = invoice.bundlePrice || 0;
    const taxAmount = invoice.taxAmount || 0;
    const discount = invoice.discount || 0; 
    const paidAmount = invoice.amount || 0;
    const gstRate = actualPrice > 0 ? ((taxAmount / actualPrice) * 100).toFixed(0) : 0; // * Calculate GST rate

    return (
        <>
            <style>{`@import url('${fontUrl}');`}</style>
             {/* Added relative position for watermark context */}
            <div className="relative bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8 text-gray-800 dark:text-gray-200 max-w-4xl mx-auto" style={{ fontFamily: `'${template.font || 'Inter'}', sans-serif` }}>

                {/* Added watermark div inside the preview container */}
                {template.watermarkText && (
                    <div className="text-watermark">{template.watermarkText}</div>
                )}
                 {/* Ensure content has higher z-index */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                        <div className="mb-6 sm:mb-0">
                            {template.logoUrl && <img src={template.logoUrl} alt="Company Logo" className="h-16 mb-4 object-contain" onError={(e) => e.target.style.display='none'}/>}
                            <h1 className="text-2xl font-bold" style={{ color: template.primaryColor }}>
                                {template.companyName}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{template.address}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{template.phone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{template.email}</p>
                            {template.gstNumber && <p className="text-sm mt-1"><strong>GSTIN:</strong> {template.gstNumber}</p>}
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <h2 className="text-3xl font-bold uppercase tracking-wider" style={{ color: template.primaryColor }}>
                                Invoice
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-mono">#{invoice.orderId}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">Payment ID: {invoice.paymentID || 'pay_xxxxxxxxxxxxxx'}</p>
                            <p><strong>Date:</strong> {invoiceDate}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold border-b-2 pb-2 mb-3 text-gray-600 dark:text-gray-300" style={{ borderColor: template.primaryColor }}>
                            Bill To:
                        </h3>
                        <p className="font-semibold">{invoice.userInfo.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.userInfo.email}</p>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr style={{ backgroundColor: template.secondaryColor, color: template.primaryColor }}>
                                <th className="p-3 text-left font-semibold rounded-l-lg">Description</th>
                                <th className="p-3 text-right font-semibold rounded-r-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            <tr>
                                <td className="p-3">{(invoice.bundleInfo || invoice.packageInfo)?.title || 'Item Name'}</td>
                                <td className="p-3 text-right font-medium">₹{actualPrice.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end mt-4">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>Actual Price</span>
                                <span>₹{actualPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                                <span>Tax (GST @{gstRate}%)</span>
                                <span>+ ₹{taxAmount.toFixed(2)}</span>
                            </div>
                            {discount > 0 &&
                                <div className="flex justify-between text-sm text-red-500">
                                    <span>Discount</span>
                                    <span>- ₹{discount.toFixed(2)}</span>
                                </div>
                            }
                            <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
                            <div className="flex justify-between items-center text-lg font-bold" style={{ color: template.primaryColor }}>
                                <span>Total Paid</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{paidAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-xs">
                        <p>{template.footerNote}</p>
                    </div>
                </div>
            </div>
        </>
    )
}