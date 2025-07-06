"use client";
import React, { useEffect, useState } from 'react';
import {
  getAllExpenses,
  createExpense,
  editExpense,
  deleteExpense
} from '../../../lib/superAdminExpensesService';
import { Box, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Spinner } from '@chakra-ui/react';

export default function SuperAdminExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', date: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      const all = await getAllExpenses();
      setExpenses(all);
      setLoading(false);
    }
    fetchExpenses();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    if (editingId) {
      await editExpense(editingId, form);
    } else {
      await createExpense(form);
    }
    setForm({ description: '', amount: '', date: '' });
    setEditingId(null);
    const all = await getAllExpenses();
    setExpenses(all);
    setActionLoading(false);
  };

  const handleEdit = (expense) => {
    setForm({ description: expense.description, amount: expense.amount, date: expense.date });
    setEditingId(expense.id);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    setActionLoading(true);
    await deleteExpense(expenseId);
    setExpenses(expenses.filter(e => e.id !== expenseId));
    setActionLoading(false);
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <Box p={6} mt={16}>
      <h2 className="text-2xl font-bold mb-4">Platform Expenses</h2>
      <form onSubmit={handleCreateOrEdit} className="mb-8 bg-white p-4 rounded shadow flex flex-col md:flex-row gap-4">
        <Input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} maxW="300px" required />
        <Input name="amount" type="number" placeholder="Amount (₹)" value={form.amount} onChange={handleFormChange} maxW="120px" required />
        <Input name="date" type="date" placeholder="Date" value={form.date} onChange={handleFormChange} maxW="160px" required />
        <Button type="submit" colorScheme="blue" isLoading={actionLoading}>{editingId ? 'Update' : 'Add'} Expense</Button>
        {editingId && <Button ml={2} onClick={() => { setForm({ description: '', amount: '', date: '' }); setEditingId(null); }}>Cancel</Button>}
      </form>
      {loading ? <Spinner size="lg" /> : (
        <>
          <Box mb={4} fontWeight="bold">Total Expenses: ₹{total}</Box>
          <Table variant="simple" className="bg-white rounded shadow">
            <Thead>
              <Tr>
                <Th>Description</Th>
                <Th>Amount (₹)</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {expenses.map(expense => (
                <Tr key={expense.id}>
                  <Td>{expense.description}</Td>
                  <Td>{expense.amount}</Td>
                  <Td>{expense.date}</Td>
                  <Td>
                    <Button size="sm" colorScheme="blue" mr={2} onClick={() => handleEdit(expense)}>Edit</Button>
                    <Button size="sm" colorScheme="red" onClick={() => handleDelete(expense.id)} isLoading={actionLoading}>Delete</Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Box>
  );
} 