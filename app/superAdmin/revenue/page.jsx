"use client";
import React, { useEffect, useState } from 'react';
import {
  getEarningsAndCommission,
  getMonthlyRevenue,
  getAllPayouts,
  markPayoutAsPaid
} from '../../../lib/superAdminRevenueService';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Spinner, Badge } from '@chakra-ui/react';

export default function SuperAdminRevenuePage() {
  const [stats, setStats] = useState({ totalEarnings: 0, platformCommission: 0 });
  const [monthly, setMonthly] = useState({});
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [earnings, monthlyRev, allPayouts] = await Promise.all([
        getEarningsAndCommission(),
        getMonthlyRevenue(),
        getAllPayouts()
      ]);
      setStats(earnings);
      setMonthly(monthlyRev);
      setPayouts(allPayouts);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleMarkPaid = async (payoutId) => {
    setActionLoading(true);
    await markPayoutAsPaid(payoutId);
    setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status: 'paid', paidAt: new Date() } : p));
    setActionLoading(false);
  };

  return (
    <Box p={6} mt={16}>
      <h2 className="text-2xl font-bold mb-4">Revenue & Payouts</h2>
      {loading ? <Spinner size="lg" /> : (
        <>
          <Box className="mb-6">
            <p><b>Total Earnings:</b> ₹{stats.totalEarnings}</p>
            <p><b>Platform Commission (20%):</b> ₹{stats.platformCommission}</p>
          </Box>
          <Box className="mb-6">
            <h3 className="font-semibold mb-2">Monthly Revenue</h3>
            <Table variant="simple" className="bg-white rounded shadow">
              <Thead>
                <Tr>
                  <Th>Month</Th>
                  <Th>Revenue (₹)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(monthly).map(([month, value]) => (
                  <Tr key={month}>
                    <Td>{month}</Td>
                    <Td>{value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box>
            <h3 className="font-semibold mb-2">Payout Requests</h3>
            <Table variant="simple" className="bg-white rounded shadow">
              <Thead>
                <Tr>
                  <Th>Admin ID</Th>
                  <Th>Amount (₹)</Th>
                  <Th>Status</Th>
                  <Th>Requested At</Th>
                  <Th>Paid At</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {payouts.map(p => (
                  <Tr key={p.id}>
                    <Td>{p.adminId}</Td>
                    <Td>{p.amount}</Td>
                    <Td>{p.status === 'paid' ? <Badge colorScheme="green">Paid</Badge> : <Badge colorScheme="yellow">Pending</Badge>}</Td>
                    <Td>{p.createdAt && p.createdAt.toDate ? p.createdAt.toDate().toLocaleString() : ''}</Td>
                    <Td>{p.paidAt && p.paidAt.toDate ? p.paidAt.toDate().toLocaleString() : ''}</Td>
                    <Td>
                      {p.status !== 'paid' && (
                        <Button size="sm" colorScheme="green" isLoading={actionLoading} onClick={() => handleMarkPaid(p.id)}>
                          Mark as Paid
                        </Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}
    </Box>
  );
} 