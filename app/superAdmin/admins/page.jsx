"use client";
import React, { useEffect, useState } from 'react';
import {
  getAllAdmins,
  validateAdmin,
  setAdminStatus,
  deleteAdmin,
  getAdminStats
} from '../../../lib/superAdminAdminService';
import { Box, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Badge } from '@chakra-ui/react';

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchAdmins() {
      setLoading(true);
      const all = await getAllAdmins();
      setAdmins(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(admins);
    else setFiltered(admins.filter(a =>
      (a.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, admins]);

  const handleValidate = async (admin) => {
    setActionLoading(true);
    await validateAdmin(admin.id);
    setAdmins(admins.map(a => a.id === admin.id ? { ...a, validated: true } : a));
    setActionLoading(false);
  };

  const handleBlockToggle = async (admin) => {
    setActionLoading(true);
    await setAdminStatus(admin.id, admin.status === 'blocked' ? 'active' : 'blocked');
    setAdmins(admins.map(a => a.id === admin.id ? { ...a, status: a.status === 'blocked' ? 'active' : 'blocked' } : a));
    setActionLoading(false);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    setActionLoading(true);
    await deleteAdmin(admin.id);
    setAdmins(admins.filter(a => a.id !== admin.id));
    setFiltered(filtered.filter(a => a.id !== admin.id));
    setActionLoading(false);
  };

  const handleRowClick = async (admin) => {
    setSelectedAdmin(admin);
    setAdminStats(null);
    onOpen();
    const stats = await getAdminStats(admin.id);
    setAdminStats(stats);
  };

  return (
    <Box p={6} mt={16}>
      <h2 className="text-2xl font-bold mb-4">Manage Admins</h2>
      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={e => setSearch(e.target.value)}
        mb={4}
        maxW="400px"
      />
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <Table variant="simple" className="bg-white rounded shadow">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Validated</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(admin => (
              <Tr key={admin.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(admin)}>
                <Td>{admin.displayName || admin.name}</Td>
                <Td>{admin.email}</Td>
                <Td>{admin.validated ? <Badge colorScheme="green">Yes</Badge> : <Badge colorScheme="yellow">No</Badge>}</Td>
                <Td>{admin.status || 'active'}</Td>
                <Td>{admin.createdAt && admin.createdAt.toDate ? admin.createdAt.toDate().toLocaleDateString() : ''}</Td>
                <Td onClick={e => e.stopPropagation()}>
                  {!admin.validated && (
                    <Button size="sm" colorScheme="blue" mr={2} isLoading={actionLoading} onClick={() => handleValidate(admin)}>
                      Validate
                    </Button>
                  )}
                  <Button size="sm" colorScheme={admin.status === 'blocked' ? 'green' : 'red'} mr={2} isLoading={actionLoading} onClick={() => handleBlockToggle(admin)}>
                    {admin.status === 'blocked' ? 'Unblock' : 'Block'}
                  </Button>
                  <Button size="sm" colorScheme="red" isLoading={actionLoading} onClick={() => handleDelete(admin)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* Admin Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Admin Details</ModalHeader>
          <ModalBody>
            {selectedAdmin && (
              <Box>
                <p><b>Name:</b> {selectedAdmin.displayName || selectedAdmin.name}</p>
                <p><b>Email:</b> {selectedAdmin.email}</p>
                <p><b>Validated:</b> {selectedAdmin.validated ? 'Yes' : 'No'}</p>
                <p><b>Status:</b> {selectedAdmin.status || 'active'}</p>
                <p><b>Joined:</b> {selectedAdmin.createdAt && selectedAdmin.createdAt.toDate ? selectedAdmin.createdAt.toDate().toLocaleString() : ''}</p>
                {adminStats ? (
                  <>
                    <p><b>Bundles Created:</b> {adminStats.bundlesCreated}</p>
                    <p><b>Revenue:</b> ₹{adminStats.revenue}</p>
                    <p><b>Engagement (Bundle Purchases):</b> {adminStats.engagement}</p>
                  </>
                ) : (
                  <Spinner size="sm" />
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 