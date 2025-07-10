"use client";
import React, { useEffect, useState } from 'react';
import {
  getAllExams,
  createExam,
  editExam,
  deleteExam
} from '../../../lib/superAdminExamsService';
import { Box, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Spinner } from '@chakra-ui/react';

export default function SuperAdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchExams() {
      setLoading(true);
      const all = await getAllExams();
      setExams(all);
      setLoading(false);
    }
    fetchExams();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    if (editingId) {
      await editExam(editingId, form);
    } else {
      await createExam(form);
    }
    setForm({ name: '' });
    setEditingId(null);
    const all = await getAllExams();
    setExams(all);
    setActionLoading(false);
  };

  const handleEdit = (exam) => {
    setForm({ name: exam.name });
    setEditingId(exam.id);
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Delete this exam?')) return;
    setActionLoading(true);
    await deleteExam(examId);
    setExams(exams.filter(e => e.id !== examId));
    setActionLoading(false);
  };

  return (
    <Box p={6} mt={8}>
      <h2 className="text-2xl font-bold mb-4">Manage Exams</h2>
      <form onSubmit={handleCreateOrEdit} className="mb-8 bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4">
        <Input name="name" placeholder="Exam Name" value={form.name} onChange={handleFormChange} maxW="300px" required />
        <Button type="submit" colorScheme="blue" isLoading={actionLoading}>{editingId ? 'Update' : 'Create'} Exam</Button>
        {editingId && <Button ml={2} onClick={() => { setForm({ name: '' }); setEditingId(null); }}>Cancel</Button>}
      </form>
      {loading ? <Spinner size="lg" /> : (
        <Table variant="simple" className="bg-white rounded shadow">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {exams.map(exam => (
              <Tr key={exam.id}>
                <Td>{exam.name}</Td>
                <Td>
                  <Button size="sm" colorScheme="blue" mr={2} onClick={() => handleEdit(exam)}>Edit</Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(exam.id)} isLoading={actionLoading}>Delete</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
} 