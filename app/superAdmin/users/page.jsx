"use client";
import React, { useEffect, useState } from 'react';
import {
  getAllUsers,
  setUserStatus,
  deleteUser,
  getUserActivity
} from '../../../lib/superAdminUserService';
import { Box, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from '@chakra-ui/react';

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const all = await getAllUsers();
      setUsers(all);
      setFiltered(all);
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!search) setFiltered(users);
    else setFiltered(users.filter(u =>
      (u.displayName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, users]);

  const handleBlockToggle = async (user) => {
    setActionLoading(true);
    await setUserStatus(user.id, user.status === 'blocked' ? 'active' : 'blocked');
    setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u));
    setActionLoading(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setActionLoading(true);
    await deleteUser(user.id);
    setUsers(users.filter(u => u.id !== user.id));
    setFiltered(filtered.filter(u => u.id !== user.id));
    setActionLoading(false);
  };

  const handleRowClick = async (user) => {
    setSelectedUser(user);
    setUserActivity(null);
    onOpen();
    const activity = await getUserActivity(user.id);
    setUserActivity(activity);
  };

  return (
    <Box p={6} mt={16}>
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
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
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filtered.map(user => (
              <Tr key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(user)}>
                <Td>{user.displayName || user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>{user.status || 'active'}</Td>
                <Td>{user.createdAt && user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : ''}</Td>
                <Td onClick={e => e.stopPropagation()}>
                  <Button size="sm" colorScheme={user.status === 'blocked' ? 'green' : 'red'} mr={2} isLoading={actionLoading} onClick={() => handleBlockToggle(user)}>
                    {user.status === 'blocked' ? 'Unblock' : 'Block'}
                  </Button>
                  <Button size="sm" colorScheme="red" isLoading={actionLoading} onClick={() => handleDelete(user)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* User Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>User Details</ModalHeader>
          <ModalBody>
            {selectedUser && (
              <Box>
                <p><b>Name:</b> {selectedUser.displayName || selectedUser.name}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Role:</b> {selectedUser.role}</p>
                <p><b>Status:</b> {selectedUser.status || 'active'}</p>
                <p><b>Joined:</b> {selectedUser.createdAt && selectedUser.createdAt.toDate ? selectedUser.createdAt.toDate().toLocaleString() : ''}</p>
                {userActivity ? (
                  <>
                    <p><b>Bundles Purchased:</b> {userActivity.bundlesPurchased}</p>
                    <p><b>Tests Taken:</b> {userActivity.testsTaken}</p>
                    <p><b>Active Time:</b> {userActivity.activeTime !== null ? `${userActivity.activeTime} days` : 'N/A'}</p>
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