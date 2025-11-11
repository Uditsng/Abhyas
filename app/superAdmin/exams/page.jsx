"use client";
import React, { useEffect, useState } from "react";
import {
  getAllExams,
  createExam,
  editExam,
  deleteExam,
} from "../../../lib/superAdminExamsService";
import { FiEdit, FiDelete } from "react-icons/fi";
import Pagination from "@/components/Pagination";

export default function SuperAdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: "", category: "", subCategory: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const examsPerPage = 10;
  const totalPages = Math.ceil(exams.length / examsPerPage);
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

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
    setForm({ name: "", category: "", subCategory: "" });
    setEditingId(null);
    const all = await getAllExams();
    setExams(all);
    setActionLoading(false);
  };

  const handleEdit = (exam) => {
    setForm({
      name: exam.name,
      category: exam.category || "",
      subCategory: exam.subCategory || "",
    });
    setEditingId(exam.id);
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("Delete this exam?")) return;
    setActionLoading(true);
    await deleteExam(examId);
    setExams(exams.filter((e) => e.id !== examId));
    setActionLoading(false);
  };

  return (
    <div className="p-4 mt-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
        Manage Exams
      </h1>

      <form
        onSubmit={handleCreateOrEdit}
        className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col md:flex-row flex-wrap gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Sub Exam Name (e.g. SBI PO)"
          value={form.name}
          onChange={handleFormChange}
          required
          className="px-4 py-2 rounded-md border w-full md:w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          name="category"
          placeholder="Main Exam Category (e.g. Banking Exams)"
          value={form.category}
          onChange={handleFormChange}
          required
          className="px-4 py-2 rounded-md border w-full md:w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          name="subCategory"
          placeholder="Sub Exam Category (e.g. SBI PO)"
          value={form.subCategory}
          onChange={handleFormChange}
          required
          className="px-4 py-2 rounded-md border w-full md:w-[300px] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={actionLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition disabled:opacity-50"
        >
          {editingId ? "Update" : "Create"} Exam
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", category: "", subCategory: "" });
              setEditingId(null);
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-md transition"
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Main Exam</th>
                <th className="px-4 py-3">Sub Exam</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExams.map((exam) => (
                <tr
                  key={exam.id}
                  className="border-t border-gray-200 dark:border-gray-600"
                >
                  <td className="px-4 py-3">{exam.name}</td>
                  <td className="px-4 py-3">{exam.category}</td>
                  <td className="px-4 py-3">{exam.subCategory}</td>
                  <td className="px-4 py-3 flex justify-end">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        disabled={actionLoading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        <FiDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
