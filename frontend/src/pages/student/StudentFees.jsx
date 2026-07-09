import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CreditCard, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const StudentFees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      if (!user?.student?._id) return;
      try {
        const res = await api.get(`/fees/student/${user.student._id}`);
        setFees(res.data);
      } catch (error) {
        console.error('Error loading student fees', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const unpaidInvoices = fees.filter((f) => f.status === 'Pending');
  const paidInvoices = fees.filter((f) => f.status === 'Paid');

  const totalDues = unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          My Fee Invoices & Dues
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Track semester invoices, pending dues, and download receipts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
        {/* Billing Dues card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 h-fit space-y-5">
          <h3 className="font-outfit text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Outstanding Balance
          </h3>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Dues</span>
            <h2 className="font-outfit text-3xl font-black text-rose-500 mt-1">
              ₹{totalDues.toLocaleString()}
            </h2>
          </div>

          <div className="border-t pt-4 dark:border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-500">
              <span>Paid Invoices</span>
              <strong className="text-slate-700 dark:text-slate-200">{paidInvoices.length} invoices</strong>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Pending Invoices</span>
              <strong className="text-slate-700 dark:text-slate-200">{unpaidInvoices.length} invoices</strong>
            </div>
          </div>

          {totalDues > 0 ? (
            <div className="flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-[11px] text-rose-500 text-left">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <p className="font-semibold leading-normal">
                Please make payment to the campus accounts desk to clear your semester dues.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-[11px] text-emerald-600 text-left">
              <CheckCircle size={16} className="shrink-0" />
              <p className="font-semibold">All semester dues cleared!</p>
            </div>
          )}
        </div>

        {/* Invoice List Table */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <div className="border-b p-4 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-705 dark:text-slate-250 uppercase tracking-wider">
              Fee Invoice History
            </h3>
          </div>

          {fees.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No invoices issued.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                    <th className="px-5 py-3">Invoice / Sem</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Transaction</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {fees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50/10">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Semester Fee {fee.semester}
                        </div>
                        <div className="text-[9px] font-semibold text-slate-400">
                          Invoice ID: {fee._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-750 font-bold dark:text-slate-200">
                        ₹{fee.amount?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-semibold">
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-[9px] font-semibold text-slate-400">
                        {fee.transactionId || '—'}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            fee.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                          }`}
                        >
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFees;
