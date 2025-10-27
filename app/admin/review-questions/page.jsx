// app/admin/review-questions/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseConfig'; 
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { Check, X, ExternalLink } from 'lucide-react'; 
import Pagination from '@/components/Pagination'; 

const ITEMS_PER_PAGE = 10;

const Spinner = () => (
    <div className="border-gray-300 h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600" />
);

export default function ReviewQuestionsPage() {
    const { user, loading: authLoading, role } = useAuth();
    const router = useRouter();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(null); 

    useEffect(() => {
        if (!authLoading && (!user || role !== 'admin')) {
            toast.error("Access denied.");
            router.push('/dashboard');
        }
    }, [user, authLoading, role, router]);

    const fetchQuestionsForReview = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'questionsForReview'),
                orderBy('timestamp', 'desc') // Show newest first
            );
            const querySnapshot = await getDocs(q);
            const fetchedQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(fetchedQuestions);
        } catch (error) {
            console.error("Error fetching questions for review: ", error);
            toast.error('Could not fetch questions marked for review.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && role === 'admin') {
            fetchQuestionsForReview();
        }
    }, [user, role]); 
    const filteredQuestions = questions.filter(q => {
        if (filterStatus === 'all') return true;
        return q.status === filterStatus;
    });

    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const updateStatus = async (id, newStatus) => {
        setActionLoading(id); 
        try {
            const questionRef = doc(db, 'questionsForReview', id);
            await updateDoc(questionRef, { status: newStatus });
            setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
            toast.success(`Question marked as ${newStatus}`);
        } catch (error) {
            console.error("Error updating status: ", error);
            toast.error('Error updating status');
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64 pt-20">
                <Spinner />
                <span className="ml-4 text-gray-700 dark:text-gray-300">Loading questions...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            <Toaster position="top-right" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-blue-600 dark:text-blue-400">
                Questions Marked for Review
            </h1>

            <div className="flex items-center mb-4 space-x-4">
                <label htmlFor="status-filter" className="font-medium text-gray-700 dark:text-gray-300">Filter by status:</label>
                <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1); 
                    }}
                    className="w-40 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="all">All</option>
                </select>
            </div>

            {filteredQuestions.length === 0 ? (
                <div className="text-center p-10 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400">
                    No questions found for the selected filter.
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">Question</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">Test ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">Marked On</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase ">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedQuestions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 max-w-xs align-top">
                                        <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3" title={q.questionText}>{q.questionText}</p>
                                        <button
                                            onClick={() => router.push(`/admin/tests/${q.testId}/questions?questionId=${q.questionId}`)} 
                                            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                            title="View Question in Test Context"
                                        >
                                            <ExternalLink size={14} /> View Context
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-top">{q.testId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 align-top" title={q.userId}>{q.userId?.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-top">{q.timestamp?.toDate().toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap align-top">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${q.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                                        {actionLoading === q.id ? (
                                            <Spinner />
                                        ) : q.status === 'pending' ? (
                                            <button
                                                onClick={() => updateStatus(q.id, 'resolved')}
                                                className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors rounded-full hover:bg-green-100 dark:hover:bg-green-900/50"
                                                title="Mark as Resolved"
                                            >
                                                <Check size={18} />
                                            </button>
                                        ) : ( 
                                            <button
                                                onClick={() => updateStatus(q.id, 'pending')}
                                                className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                                                title="Mark as Pending"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6">
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                 />
                </div>
            )}
        </div>
    );
}
