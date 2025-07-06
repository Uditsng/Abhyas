"use client";
import React, { useEffect, useState } from 'react';
import {
  getAllPackages,
  createPackage,
  editPackage,
  deletePackage,
  getPackageStats,
  getAllBundles
} from '../../../lib/superAdminPackagesService';
import { Box, Button, Input, Select, Table, Thead, Tbody, Tr, Th, Td, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@chakra-ui/react';

export default function SuperAdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [form, setForm] = useState({ name: '', examId: '', bundleIds: [], price: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageStats, setPackageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [pkgs, bnds] = await Promise.all([
        getAllPackages(),
        getAllBundles()
      ]);
      setPackages(pkgs);
      setBundles(bnds);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === 'select-multiple') {
      setForm(f => ({ ...f, [name]: Array.from(selectedOptions, o => o.value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    if (editingId) {
      await editPackage(editingId, form);
    } else {
      await createPackage(form);
    }
    setForm({ name: '', examId: '', bundleIds: [], price: '' });
    setEditingId(null);
    const pkgs = await getAllPackages();
    setPackages(pkgs);
    setActionLoading(false);
  };

  const handleEdit = (pkg) => {
    setForm({ name: pkg.name, examId: pkg.examId, bundleIds: pkg.bundleIds || [], price: pkg.price });
    setEditingId(pkg.id);
  };

  const handleDelete = async (pkgId) => {
    if (!window.confirm('Delete this package?')) return;
    setActionLoading(true);
    await deletePackage(pkgId);
    setPackages(packages.filter(p => p.id !== pkgId));
    setActionLoading(false);
  };

  const handleRowClick = async (pkg) => {
    setSelectedPackage(pkg);
    setPackageStats(null);
    onOpen();
    const stats = await getPackageStats(pkg.id);
    setPackageStats(stats);
  };

  return (
    <Box p={6} mt={16}>
      <h2 className="text-2xl font-bold mb-4">Manage Packages</h2>
      <form onSubmit={handleCreateOrEdit} className="mb-8 bg-white p-4 rounded shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input name="name" placeholder="Package Name" value={form.name} onChange={handleFormChange} maxW="200px" required />
          <Input name="examId" placeholder="Exam ID" value={form.examId} onChange={handleFormChange} maxW="200px" required />
          <Select name="bundleIds" multiple value={form.bundleIds} onChange={handleFormChange} maxW="300px">
            {bundles.map(b => <option key={b.id} value={b.id}>{b.title || b.id}</option>)}
          </Select>
          <Input name="price" type="number" placeholder="Price (₹)" value={form.price} onChange={handleFormChange} maxW="120px" required />
        </div>
        <Button type="submit" colorScheme="blue" isLoading={actionLoading}>{editingId ? 'Update' : 'Create'} Package</Button>
        {editingId && <Button ml={2} onClick={() => { setForm({ name: '', examId: '', bundleIds: [], price: '' }); setEditingId(null); }}>Cancel</Button>}
      </form>
      {loading ? <Spinner size="lg" /> : (
        <Table variant="simple" className="bg-white rounded shadow">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Exam ID</Th>
              <Th>Bundles</Th>
              <Th>Price (₹)</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {packages.map(pkg => (
              <Tr key={pkg.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleRowClick(pkg)}>
                <Td>{pkg.name}</Td>
                <Td>{pkg.examId}</Td>
                <Td>{(pkg.bundleIds || []).map(bid => {
                  const b = bundles.find(b => b.id === bid);
                  return b ? (b.title || b.id) : bid;
                }).join(', ')}</Td>
                <Td>{pkg.price}</Td>
                <Td onClick={e => e.stopPropagation()}>
                  <Button size="sm" colorScheme="blue" mr={2} onClick={() => handleEdit(pkg)}>Edit</Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(pkg.id)} isLoading={actionLoading}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {/* Package Stats Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Package Stats</ModalHeader>
          <ModalBody>
            {selectedPackage && packageStats ? (
              <Box>
                <p><b>Name:</b> {selectedPackage.name}</p>
                <p><b>Exam ID:</b> {selectedPackage.examId}</p>
                <p><b>Bundles:</b> {(selectedPackage.bundleIds || []).map(bid => {
                  const b = bundles.find(b => b.id === bid);
                  return b ? (b.title || b.id) : bid;
                }).join(', ')}</p>
                <p><b>Price:</b> ₹{selectedPackage.price}</p>
                <p><b>Total Sales:</b> {packageStats.totalSales}</p>
                <p><b>Total Revenue:</b> ₹{packageStats.totalRevenue}</p>
              </Box>
            ) : <Spinner size="sm" />}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 