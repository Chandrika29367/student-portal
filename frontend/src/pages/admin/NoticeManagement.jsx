import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DEPARTMENTS = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (error) {
      console.error('Error fetching notices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openModal = () => {
    setModalError(null);
    setModalSuccess(null);
    reset({
      title: '',
      content: '',
      targetDepartment: 'All',
      targetSemester: 0, // All
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setModalLoading(true);
    setModalError(null);
    setModalSuccess(null);
    try {
      await api.post('/notices', {
        title: data.title,
        content: data.content,
        targetDepartment: data.targetDepartment,
        targetSemester: parseInt(data.targetSemester),
      });
      setModalSuccess('Announcement published successfully on the bulletin!');
      fetchNotices();
      // Auto close after brief timeout
      setTimeout(() => setShowModal(false), 1500);
    } catch (error) {
      setModalError(error.response?.data?.message || 'Failed to publish notice.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice? This action is permanent.')) {
      return;
    }
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      alert('Error deleting notice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
            Announcements & Notice Board
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Publish reminders, test announcements, or general newsletters.
          </p>
        </div>
        
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          <span>Publish Announcement</span>
        </button>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : notices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Megaphone className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-xs font-semibold text-slate-400">Notice board is currently empty.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover-lift dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-brand-500">
                    {notice.targetDepartment === 'All' ? 'General' : notice.targetDepartment}
                    {notice.targetSemester > 0 && ` • Sem ${notice.targetSemester}`}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-rose-500 dark:hover:bg-slate-800"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-line leading-relaxed">
                  {notice.content}
                </p>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[9px] font-semibold text-slate-400">
                  By: {notice.publishedBy?.username || 'System Admin'}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400">
                  <Calendar size={11} />
                  {new Date(notice.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Composer Modal */}
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

            <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Megaphone size={16} className="text-brand-500" />
              <span>Compose Bulletin Notice</span>
            </h2>

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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. End Term Examination Admit Cards"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                />
                {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Department Audience
                </label>
                <select
                  {...register('targetDepartment')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Target Semester Audience
                </label>
                <select
                  {...register('targetSemester')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value={0}>All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Announcement Details
                </label>
                <textarea
                  rows="4"
                  placeholder="Compose notice body..."
                  {...register('content', { required: 'Details are required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                ></textarea>
                {errors.content && <p className="text-[10px] text-rose-500 mt-1">{errors.content.message}</p>}
              </div>

              {/* Submit Buttons */}
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
                  {modalLoading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
