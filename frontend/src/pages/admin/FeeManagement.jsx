import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Invoice Modal
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);
  
  // Student lookup in Modal
  const [modalSearchVal, setModalSearchVal] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees', {
        params: {
          studentId: studentSearch || undefined, // searches by ID
          status: statusFilter || undefined,
        },
      });
      setFees(res.data);
    } catch (error) {
      console.error('Error fetching fees', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFees();
  };

  // Toggle Fee status
  const handleToggleStatus = async (feeId, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await api.put(`/fees/${feeId}`, {
        status: newStatus,
        transactionId: newStatus === 'Paid' ? `TXN${Date.now()}` : null,
      });
      fetchFees();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating fee status');
    }
  };

  // Find student in Invoice Modal
  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!modalSearchVal.trim()) return;

    setSearchLoading(true);
    setModalError(null);
    setFoundStudent(null);
    try {
      const res = await api.get('/students', {
        params: { search: modalSearchVal, limit: 1 },
      });
      if (res.data.students.length > 0) {
        setFoundStudent(res.data.students[0]);
      } else {
        setModalError('No student found.');
      }
    } catch (error) {
      setModalError('Error searching student.');
    } finally {
      setSearchLoading(false);
    }
  };

  const openInvoiceModal = () => {
    setFoundStudent(null);
    setModalSearchVal('');
    setModalError(null);
    setModalSuccess(null);
    reset({
      semester: 1,
      amount: 65000,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days out
    });
    setShowModal(true);
  };

  const onInvoiceSubmit = async (data) => {
    if (!foundStudent) {
      setModalError('Please search and select a student first.');
      return;
    }
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);
    try {
      await api.post('/fees', {
        studentId: foundStudent._id,
        semester: parseInt(data.semester),
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
      });
      setModalSuccess(`Invoice issued successfully to ${foundStudent.name}!`);
      fetchFees();
    } catch (error) {
      setModalError(error.response?.data?.message || 'Error generating invoice.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
            Accounts & Fee Management
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Track student semester fee invoices, payment statuses, and collections.
          </p>
        </div>
        
        <button
          onClick={openInvoiceModal}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          <span>Issue New Invoice</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search Student ID (e.g. STU2026001)..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 px-4 py-2 text-xs font-bold transition-all"
          >
            Find
          </button>
        </form>
      </div>

      {/* Fees List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                <th className="px-6 py-4">Student ID / Name</th>
                <th className="px-6 py-4">Semester</th>
                <th className="px-6 py-4">Invoiced Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Paid Date</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-semibold text-slate-400">
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {fee.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {fee.student?.studentId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Semester {fee.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        ₹{fee.amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-500">
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-500">
                        {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        {fee.transactionId || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(fee._id, fee.status)}
                        className={`rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                          fee.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}
                      >
                        {fee.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
              Issue Student Fee Invoice
            </h2>

            {/* Quick search input */}
            <form onSubmit={handleStudentSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search roll/name/ID..."
                value={modalSearchVal}
                onChange={(e) => setModalSearchVal(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-xl bg-slate-800 text-white px-4 text-xs font-bold hover:bg-slate-900 dark:bg-slate-700 disabled:opacity-50"
              >
                {searchLoading ? 'Finding...' : 'Find'}
              </button>
            </form>

            {modalError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
                <AlertCircle size={14} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600">
                <CheckCircle size={14} className="shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {foundStudent ? (
              <form onSubmit={handleSubmit(onInvoiceSubmit)} className="space-y-4">
                {/* Found Student Header */}
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/40 border">
                  <img
                    src={foundStudent.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundStudent.name)}`}
                    alt="Student"
                    className="h-9 w-9 rounded-lg"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {foundStudent.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      Roll: {foundStudent.rollNumber} • Semester {foundStudent.semester}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Semester
                  </label>
                  <select
                    {...register('semester', { required: true })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Amount (₹)
                  </label>
                  <input
                    type="number"
                    {...register('amount', { required: 'Amount is required' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Invoice Due Date
                  </label>
                  <input
                    type="date"
                    {...register('dueDate', { required: 'Due Date is required' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  {errors.dueDate && <p className="text-[10px] text-rose-500 mt-1">{errors.dueDate.message}</p>}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                  >
                    {modalLoading ? 'Generating...' : 'Issue Invoice'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-slate-300 dark:text-slate-600">
                <FileText size={32} />
                <p className="text-xs font-semibold text-slate-400 mt-1.5">Search and select a student above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;
