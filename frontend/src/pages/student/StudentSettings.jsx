import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

const StudentSettings = () => {
  const { changePassword } = useAuth();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      setSuccess('Your password has been updated successfully!');
      reset();
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Change passwords or configure notification preferences.
        </p>
      </div>

      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-brand-500" />
          <span>Update Security Password</span>
        </h3>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600">
            <CheckCircle size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Current Security Password
            </label>
            <input
              type="password"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
            />
            {errors.currentPassword && <p className="text-[10px] text-rose-500 mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
            />
            {errors.newPassword && <p className="text-[10px] text-rose-500 mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Verify New Password
            </label>
            <input
              type="password"
              {...register('confirmPassword', { required: 'Confirm password is required' })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
            />
            {errors.confirmPassword && <p className="text-[10px] text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-brand-500 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentSettings;
