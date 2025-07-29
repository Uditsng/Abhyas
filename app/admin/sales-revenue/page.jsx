// "use client";

// import { useEffect, useState } from "react";
// import { getBundlesByAdmin, getOrdersForBundle, getUserInfo,} from "@/lib/salesService";
// import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner, Input, Text,} from "@chakra-ui/react";
// import { useAuth } from "@/components/AuthContext";

// export default function SalesRevenuePage() {
//   const { user } = useAuth();
//   const [salesData, setSalesData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [startDate, setStartDate] = useState(
//     () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//   );
//   const [endDate, setEndDate] = useState(() => new Date());

//   useEffect(() => {
//     if (!user?.uid) return;

//     const fetchData = async () => {
//       setLoading(true);
//       const bundles = await getBundlesByAdmin(user.uid);
//       const result = [];

//       for (const bundle of bundles) {
//         const orders = await getOrdersForBundle(bundle.id, startDate, endDate);
//         let totalRevenue = 0;
//         const buyers = [];

//         for (const order of orders) {
//           totalRevenue += order.amount / 100;
//           const userData = await getUserInfo(order.userId);
//           if (userData) {
//             buyers.push({
//               name: userData.displayName,
//               email: userData.email,
//               date: order.date.toDate(),
//               amount: order.amount / 100,
//             });
//           }
//         }

//         result.push({
//           bundleTitle: bundle.title,
//           price: bundle.price,
//           sold: buyers.length,
//           totalRevenue,
//           buyers,
//         });
//       }

//       setSalesData(result);
//       setLoading(false);
//     };

//     fetchData();
//   }, [user, startDate, endDate]);

//   if (loading) return <Spinner size="xl" mt={10} />;

//   return (
//     <Box p={6}>
//       <Heading mb={4}>Sales Revenue</Heading>

//       <Box mb={6} display="flex" gap={4}>
//         <Box>
//           <Text fontWeight="medium">Start Date</Text>
//           <Input
//             type="date"
//             value={startDate.toISOString().split("T")[0]}
//             onChange={(e) => setStartDate(new Date(e.target.value))}
//           />
//         </Box>
//         <Box>
//           <Text fontWeight="medium">End Date</Text>
//           <Input
//             type="date"
//             value={endDate.toISOString().split("T")[0]}
//             onChange={(e) => setEndDate(new Date(e.target.value))}
//           />
//         </Box>
//       </Box>

//       {salesData.map((bundle, idx) => (
//         <Box key={idx} mb={10} p={5} border="1px solid #ddd" borderRadius="lg">
//           <Heading size="md" mb={2}>
//             {bundle.bundleTitle}
//           </Heading>
//           <Text>Price: ₹{bundle.price}</Text>
//           <Text>Units Sold: {bundle.sold}</Text>
//           <Text>Total Revenue: ₹{bundle.totalRevenue.toFixed(2)}</Text>

//           <Table mt={4} variant="simple">
//             <Thead>
//               <Tr>
//                 <Th>User</Th>
//                 <Th>Email</Th>
//                 <Th>Purchase Date</Th>
//                 <Th>Amount</Th>
//               </Tr>
//             </Thead>
//             <Tbody>
//               {bundle.buyers.map((buyer, i) => (
//                 <Tr key={i}>
//                   <Td>{buyer.name}</Td>
//                   <Td>{buyer.email}</Td>
//                   <Td>{buyer.date.toLocaleDateString()}</Td>
//                   <Td>₹{buyer.amount}</Td>
//                 </Tr>
//               ))}
//             </Tbody>
//           </Table>
//         </Box>
//       ))}
//     </Box>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import {
  getBundlesByAdmin,
  getOrdersForBundle,
  getUserInfo,
} from "@/lib/salesService";
import { useAuth } from "@/components/AuthContext";

export default function SalesRevenuePage() {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState(
    () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(() => new Date());

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      const bundles = await getBundlesByAdmin(user.uid);
      const result = [];

      for (const bundle of bundles) {
        const orders = await getOrdersForBundle(bundle.id, startDate, endDate);
        let totalRevenue = 0;
        const buyers = [];

        for (const order of orders) {
          totalRevenue += order.amount / 100;
          const userData = await getUserInfo(order.userId);
          if (userData) {
            buyers.push({
              name: userData.displayName,
              email: userData.email,
              date: order.date.toDate(),
              amount: order.amount / 100,
            });
          }
        }

        result.push({
          bundleTitle: bundle.title,
          price: bundle.price,
          sold: buyers.length,
          totalRevenue,
          buyers,
        });
      }

      setSalesData(result);
      setLoading(false);
    };

    fetchData();
  }, [user, startDate, endDate]);

  if (loading)
    return (
      <div className="flex justify-center items-center mt-10">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Sales Revenue</h1>

      {/* Date Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={startDate.toISOString().split("T")[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">End Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={endDate.toISOString().split("T")[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
      </div>

      {/* Revenue Sections */}
      {salesData.map((bundle, idx) => (
        <div
          key={idx}
          className="mb-10 p-5 border border-gray-300 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-2">{bundle.bundleTitle}</h2>
          <div className="flex space-x-6 text-sm text-gray-500 mt-1">
          <span>Price: ₹{bundle.price}</span>
          <span>Units Sold: {bundle.sold}</span>
          <span>Total Revenue: ₹{bundle.totalRevenue.toFixed(2)}</span>
          </div>

          {/* Buyers Table */}
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-2 border">User</th>
                  <th className="text-left px-4 py-2 border">Email</th>
                  <th className="text-left px-4 py-2 border">Purchase Date</th>
                  <th className="text-left px-4 py-2 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bundle.buyers.map((buyer, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="px-4 py-2 border">{buyer.name}</td>
                    <td className="px-4 py-2 border">{buyer.email}</td>
                    <td className="px-4 py-2 border">
                      {buyer.date.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">₹{buyer.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
