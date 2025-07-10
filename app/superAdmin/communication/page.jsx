"use client";
import React, { useEffect, useState } from 'react';
import { sendNotification, getAllNotifications } from '../../../lib/superAdminCommunicationService';
import { Box, Button, Input, Select, Textarea, Table, Thead, Tbody, Tr, Th, Td, Spinner, Badge } from '@chakra-ui/react';

export default function SuperAdminCommunicationPage() {
  const [message, setMessage] = useState('');
  const [role, setRole] = useState('all');
  const [to, setTo] = useState('all');
  const [type, setType] = useState('announcement');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      const all = await getAllNotifications();
      setNotifications(all);
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    await sendNotification({ to, role, message, type });
    setMessage('');
    setTo('all');
    setRole('all');
    setType('announcement');
    // Refresh notifications
    const all = await getAllNotifications();
    setNotifications(all);
    setSending(false);
  };

  return (
    <Box p={6} mt={8}>
      <h2 className="text-2xl font-bold mb-4">Communication & Announcements</h2>
      <form onSubmit={handleSend} className="mb-8 bg-white p-4 rounded shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Select value={type} onChange={e => setType(e.target.value)} maxW="200px">
            <option value="announcement">Announcement (Broadcast)</option>
            <option value="direct">Direct Message</option>
          </Select>
          <Select value={role} onChange={e => setRole(e.target.value)} maxW="200px">
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Users Only</option>
          </Select>
          {type === 'direct' && (
            <Input placeholder="Recipient User/Admin ID" value={to} onChange={e => setTo(e.target.value)} maxW="300px" />
          )}
        </div>
        <Textarea
          placeholder="Enter your message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          mb={4}
        />
        <Button type="submit" colorScheme="blue" isLoading={sending}>Send</Button>
      </form>
      <h3 className="font-semibold mb-2">Sent Notifications & Announcements</h3>
      {loading ? <Spinner size="lg" /> : (
        <Table variant="simple" className="bg-white rounded shadow">
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Role</Th>
              <Th>To</Th>
              <Th>Message</Th>
              <Th>Sent At</Th>
            </Tr>
          </Thead>
          <Tbody>
            {notifications.map(n => (
              <Tr key={n.id}>
                <Td>{n.type === 'announcement' ? <Badge colorScheme="blue">Announcement</Badge> : <Badge colorScheme="purple">Direct</Badge>}</Td>
                <Td>{n.role}</Td>
                <Td>{n.to}</Td>
                <Td>{n.message}</Td>
                <Td>{n.createdAt && n.createdAt.toDate ? n.createdAt.toDate().toLocaleString() : ''}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
} 