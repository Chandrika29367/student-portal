import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Home,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const StudentProfile = () => {
  const { user, updateStudentProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const student = user?.student;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      phoneNumber: student?.phoneNumber || '',
      address: student?.address || '',
      parentContact: student?.parentContact || '',
      profilePicture: student?.profilePicture || '',
    },
  });

  if (!student) return null;

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.put(`/students/${student._id}`, data);
      updateStudentProfile(res.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          My Profile Details
        </h1>
        <p className="text-sm font-medium text-slate-500">
          View your academic enrollment record and update contact information.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 max-w-2xl">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 max-w-2xl">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
        {/* Profile Card Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 h-fit">
          <div className="flex flex-col items-center">
            <img
              src={student.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
              alt="Profile"
              className="h-24 w-24 rounded-3xl object-cover border ring-4 ring-brand-500/10 mb-4"
            />
            <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {student.name}
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
              Roll: {student.rollNumber}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-brand-50 border border-brand-100 px-3 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-600 dark:bg-brand-950/20 dark:text-brand-400">
              {student.department}
            </span>
          </div>

          <div className="mt-6 border-t pt-5 text-left space-y-3.5 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <User size={14} />
              <span>ID: <strong className="text-slate-800 dark:text-slate-200">{student.studentId}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <Mail size={14} />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <Calendar size={14} />
              <span>DOB: <strong className="text-slate-800 dark:text-slate-200">{student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}</strong></span>
            </div>
          </div>
        </div>

        {/* Profile editing or details board */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <div className="flex items-center justify-between border-b pb-4 mb-5 dark:border-slate-800">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
              {editing ? 'Update Contact Information' : 'Personal & Enrollment Details'}
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              className="rounded-xl border px-3 py-1.5 text-[10px] font-bold tracking-wide hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Contact'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Profile Picture URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('profilePicture')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register('phoneNumber')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Parent Emergency Phone
                  </label>
                  <input
                    type="text"
                    {...register('parentContact')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                />
              </div>

              <div className="flex justify-end pt-3 border-t dark:border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 disabled:opacity-50 active:scale-[0.98] transition-all"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                  Academic Enrollment
                </h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Enrolled Semester</span>
                    <strong className="text-slate-700 dark:text-slate-200">Semester {student.semester}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Academic Status</span>
                    <strong className="text-emerald-500 font-bold uppercase tracking-wider text-[10px]">Active Enrolled</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Registered Department</span>
                    <strong className="text-slate-700 dark:text-slate-200">{student.department}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                  Contact Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-350">
                    <Phone size={14} className="mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block mb-0.5">Student Mobile</span>
                      <strong className="text-slate-700 dark:text-slate-200">{student.phoneNumber || 'Not provided'}</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-350">
                    <Home size={14} className="mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block mb-0.5">Parent / Emergency Contact</span>
                      <strong className="text-slate-700 dark:text-slate-200">{student.parentContact || 'Not provided'}</strong>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-350">
                    <MapPin size={14} className="mt-0.5 text-slate-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block mb-0.5">Residential Address</span>
                      <strong className="text-slate-700 dark:text-slate-200 leading-normal">{student.address || 'Not provided'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
