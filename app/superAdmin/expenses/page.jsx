"use client";

import React, { useEffect, useState } from "react";
import {
  getAllExpenses,
  createExpense,
  editExpense,
  deleteExpense,
} from "../../../lib/superAdminExpensesService";
import { Spinner } from "@chakra-ui/react";
import {FiEdit, FiDelete} from 'react-icons/fi'

export default function SuperAdminExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    setForm({ description: "", amount: "", date: "" });
    setEditingId(null);
    const all = await getAllExpenses();
    setExpenses(all);
    setActionLoading(false);
  };

  const handleEdit = (expense) => {
    setForm({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
    });
    setEditingId(expense.id);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    setActionLoading(true);
    await deleteExpense(expenseId);
    setExpenses(expenses.filter((e) => e.id !== expenseId));
    setActionLoading(false);
  };

  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  return (
    <div className="p-4 mt-2">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">Revenue & Payouts</h1>


      <form
        onSubmit={handleCreateOrEdit}
        className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4 flex-wrap"
      >
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleFormChange}
          className="px-4 py-2 border rounded-md w-full md:max-w-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleFormChange}
          className="px-4 py-2 border rounded-md w-full md:max-w-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
          required
        />
        <input
          name="date"
          type="date"
          placeholder="Date"
          value={form.date}
          onChange={handleFormChange}
          className="px-4 py-2 border rounded-md w-full md:max-w-xs dark:bg-gray-900 dark:text-white dark:border-gray-700"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
          disabled={actionLoading}
        >
          {editingId ? "Update" : "Add"} Expense
        </button>
        {editingId && (
          <button
            ml={2}
            onClick={() => {
              setForm({ description: "", amount: "", date: "" });
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-lg font-bold text-blue-600 dark:text-blue-500 mb-4"><span className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
            Total Expenses:</span> ₹{total}
            </h1>
          </div>

          <div className="overflow-x-auto rounded-xl shadow-md ">
            <table className="min-w-full bg-white dark:bg-gray-900 rounded-xl shadow-md">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount (₹)</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-t bg-white dark:bg-gray-800"
                  >
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2">{expense.amount}</td>
                    <td className="px-4 py-2">{expense.date}</td>
                    <td className="px-4 py-3 flex justify-end">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <FiEdit/>
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        disabled={actionLoading}
                        onClick={() => handleDelete(expense.id)}
                      >
                        <FiDelete/>
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 border rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="px-3 py-1 text-gray-700 dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="px-3 py-1 border rounded bg-gray-200 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
