// "use client";
// import React, { useEffect, useState } from "react";
// import { db } from "../../../lib/firebaseConfig";
// import { setDoc, doc } from "firebase/firestore";
// import {
//   getEarningsAndCommission,
//   getMonthlyRevenue,
//   getAllPayouts,
//   markPayoutAsPaid,
// } from "../../../lib/superAdminRevenueService";
// import { getAllExpenses } from "../../../lib/superAdminExpensesService";
// import {
//   Box,
//   Button,
//   Table,
//   Thead,
//   Tbody,
//   Tr,
//   Th,
//   Td,
//   Spinner,
//   Badge,
//   Flex,
//   useColorModeValue,
// } from "@chakra-ui/react";
// import { getPlatformCommissionRate } from "@/lib/superAdminRevenueService";

// export default function SuperAdminRevenuePage() {
//   const [stats, setStats] = useState({
//     totalEarnings: 0,
//     platformCommission: 0,
//   });
//   const [monthly, setMonthly] = useState({});
//   const [payouts, setPayouts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [expenses, setExpenses] = useState([]);
//   const [platformCommission, setPlatformCommission] = useState(0);

//   useEffect(() => {
//     async function fetchData() {
//       setLoading(true);
//       const [earnings, monthlyRev, allPayouts, allExpenses, commissionRate] =
//         await Promise.all([
//           getEarningsAndCommission(),
//           getMonthlyRevenue(),
//           getAllPayouts(),
//           getAllExpenses(),
//           getPlatformCommissionRate(),
//         ]);
//       setStats(earnings);
//       setMonthly(monthlyRev);
//       setPayouts(allPayouts);
//       setExpenses(allExpenses);
//       setPlatformCommission(commissionRate);
//       setLoading(false);
//     }
//     fetchData();
//   }, []);

//   const handleMarkPaid = async (payoutId) => {
//     setActionLoading(true);
//     await markPayoutAsPaid(payoutId);
//     setPayouts(
//       payouts.map((p) =>
//         p.id === payoutId ? { ...p, status: "paid", paidAt: new Date() } : p
//       )
//     );
//     setActionLoading(false);
//   };

//   // Add color mode values
//   const tableBg = useColorModeValue("white", "gray.800");
//   const textColor = useColorModeValue("gray.900", "gray.100");
//   const cardBg = useColorModeValue("white", "gray.800");

//   return (
//     <Box p={6} mt={8} color={textColor}>
//       <h2 className="text-2xl font-bold mb-4">Revenue & Payouts</h2>
//       {loading ? (
//         <Spinner size="lg" />
//       ) : (
//         <>
//           <Flex
//             justify="space-between"
//             align="flex-start"
//             mb={6}
//             direction={{ base: "column", md: "row" }}
//           >
//             <Box
//               className="mb-6"
//               mb={{ base: 4, md: 0 }}
//               bg={cardBg}
//               p={4}
//               borderRadius="md"
//               boxShadow="md"
//             >
//               <p>
//                 <b>Total Earnings:</b> ₹{stats.totalEarnings}
//               </p>
//               <p>
//                 <b>Package Earnings:</b> ₹{stats.totalEarnings}
//               </p>
//               {/* <p><b>Platform Commission (20%):</b> ₹{platformCommission}</p> */}
//             </Box>
//             <Box
//               mb={4}
//               fontWeight="bold"
//               minW="220px"
//               bg={cardBg}
//               p={4}
//               borderRadius="md"
//               boxShadow="md"
//             >
//               Total Expenses: ₹
//               {expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)}
//             </Box>
//           </Flex>

//           <Box mb={4} bg={cardBg} p={4} borderRadius="md" boxShadow="md">
//             <h3 className="font-semibold mb-2">Platform Commission Rate</h3>
//             <Flex align="center" gap={4}>
//               <input
//                 type="number"
//                 value={platformCommission}
//                 onChange={(e) => setPlatformCommission(e.target.value)}
//                 className="border px-3 py-1 rounded"
//               />
//               <Button
//                 colorScheme="blue"
//                 onClick={async () => {
//                   await setDoc(doc(db, "platformSettings", "commission"), {
//                     rate: Number(platformCommission),
//                   });
//                   alert("Commission updated.");
//                 }}
//               >
//                 Save
//               </Button>
//             </Flex>
//           </Box>
//           <Box
//             className="mb-6"
//             bg={cardBg}
//             p={4}
//             borderRadius="md"
//             boxShadow="md"
//           >
//             <h3 className="font-semibold mb-2">Monthly Revenue</h3>
//             <Table
//               variant="simple"
//               bg={tableBg}
//               borderRadius="md"
//               boxShadow="sm"
//             >
//               <Thead>
//                 <Tr>
//                   <Th>Month</Th>
//                   <Th>Revenue (₹)</Th>
//                 </Tr>
//               </Thead>
//               <Tbody>
//                 {Object.entries(monthly).map(([month, value]) => (
//                   <Tr key={month}>
//                     <Td>{month}</Td>
//                     <Td>{value}</Td>
//                   </Tr>
//                 ))}
//               </Tbody>
//             </Table>
//           </Box>
//           <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
//             <h3 className="font-semibold mb-2">Payout Requests</h3>
//             <Table
//               variant="simple"
//               bg={tableBg}
//               borderRadius="md"
//               boxShadow="sm"
//             >
//               <Thead>
//                 <Tr>
//                   <Th>Admin ID</Th>
//                   <Th>Amount (₹)</Th>
//                   <Th>Status</Th>
//                   <Th>Requested At</Th>
//                   <Th>Paid At</Th>
//                   <Th>Actions</Th>
//                 </Tr>
//               </Thead>
//               <Tbody>
//                 {payouts.map((p) => (
//                   <Tr key={p.id}>
//                     <Td>{p.adminId}</Td>
//                     <Td>{p.amount}</Td>
//                     <Td>
//                       {p.status === "paid" ? (
//                         <Badge colorScheme="green">Paid</Badge>
//                       ) : (
//                         <Badge colorScheme="yellow">Pending</Badge>
//                       )}
//                     </Td>
//                     <Td>
//                       {p.createdAt && p.createdAt.toDate
//                         ? p.createdAt.toDate().toLocaleString()
//                         : ""}
//                     </Td>
//                     <Td>
//                       {p.paidAt && p.paidAt.toDate
//                         ? p.paidAt.toDate().toLocaleString()
//                         : ""}
//                     </Td>
//                     <Td>
//                       {p.status !== "paid" && (
//                         <Button
//                           size="sm"
//                           colorScheme="green"
//                           isLoading={actionLoading}
//                           onClick={() => handleMarkPaid(p.id)}
//                         >
//                           Mark as Paid
//                         </Button>
//                       )}
//                     </Td>
//                   </Tr>
//                 ))}
//               </Tbody>
//             </Table>
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// // }

// version 2

"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import {
  getEarningsAndCommission,
  getMonthlyRevenue,
  getAllPayouts,
  markPayoutAsPaid,
  getPlatformCommissionRate,
} from "../../../lib/superAdminRevenueService";
import { getAllExpenses } from "../../../lib/superAdminExpensesService";

export default function SuperAdminRevenuePage() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    platformCommission: 0,
  });
  const [monthly, setMonthly] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [platformCommission, setPlatformCommission] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [earnings, monthlyRev, allPayouts, allExpenses, commissionRate] =
        await Promise.all([
          getEarningsAndCommission(),
          getMonthlyRevenue(),
          getAllPayouts(),
          getAllExpenses(),
          getPlatformCommissionRate(),
        ]);
      setStats(earnings);
      setMonthly(monthlyRev);
      setPayouts(allPayouts);
      setExpenses(allExpenses);
      setPlatformCommission(commissionRate);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleMarkPaid = async (payoutId) => {
    setActionLoading(true);
    await markPayoutAsPaid(payoutId);
    setPayouts(
      payouts.map((p) =>
        p.id === payoutId ? { ...p, status: "paid", paidAt: new Date() } : p
      )
    );
    setActionLoading(false);
  };

  return (
    <div className="p-6 mt-8">
      <h2 className="text-3xl font-bold mb-6">Revenue & Payouts</h2>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">Earnings</h3>
              <p>
                <b>Total Sales:</b> ₹{stats.totalEarnings}
              </p>
              <p>
                <b>Platform Commission:</b> ₹{stats.platformCommission}
              </p>
              <p>
                <b>Admin Earnings:</b> ₹{stats.totalAdminEarning}
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">Expenses</h3>
              <p>
                Total Expenses: ₹
                {expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-2">Platform Commission Rate</h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={async () => {
                    await setDoc(doc(db, "platformSettings", "commission"), {
                      rate: Number(platformCommission),
                    });
                    alert("Commission updated.");
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow mb-6">
            <h3 className="font-semibold mb-4">Monthly Revenue</h3>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Revenue (₹)</th>
                  <th className="p-2 border">Platform Commission (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthly).map(([month, value]) => (
                  <tr key={month} className="border-t">
                    <td className="p-2 border">{month}</td>
                    <td className="p-2 border">{value.sales}</td>
                    <td className="p-2 border">{value.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-4">Payout Requests</h3>
            <table className="w-full text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Admin ID</th>
                  <th className="p-2 border">Amount (₹)</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Requested At</th>
                  <th className="p-2 border">Paid At</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No payout requests found.
                    </td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-2 border">{p.adminId}</td>
                      <td className="p-2 border">{p.amount}</td>
                      <td className="p-2 border">
                        <span
                          className={`px-2 py-1 rounded text-white text-sm ${
                            p.status === "paid"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {p.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="p-2 border">
                        {p.createdAt?.toDate?.().toLocaleString() || ""}
                      </td>
                      <td className="p-2 border">
                        {p.paidAt?.toDate?.().toLocaleString() || ""}
                      </td>
                      <td className="p-2 border">
                        {p.status !== "paid" && (
                          <button
                            className="bg-green-600 text-white px-3 py-1 text-sm rounded"
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Loading..." : "Mark as Paid"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
