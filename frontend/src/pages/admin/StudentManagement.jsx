import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  UserCheck
} from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology'];

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [feeFilter, setFeeFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const limit = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: {
          page,
          limit,
          search,
          department: deptFilter,
          semester: semFilter,
          feeStatus: feeFilter,
        },
      });
      setStudents(res.data.students);
      setTotalPages(res.data.pages);
      setTotalStudents(res.data.total);
    } catch (error) {
      console.error('Error fetching students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, deptFilter, semFilter, feeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setModalError(null);
    reset({
      studentId: `STU${Date.now().toString().slice(-7)}`, // pre-populate with random ID
      rollNumber: `26CS${Math.floor(100 + Math.random() * 899)}`, // pre-populate
      name: '',
      email: '',
      phoneNumber: '',
      department: 'Computer Science',
      semester: 1,
      dateOfBirth: '',
      address: '',
      parentContact: '',
      cgpa: 0,
      attendancePercentage: 0,
      feeStatus: 'Pending',
    });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setModalError(null);
    reset({
      studentId: student.studentId,
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber || '',
      department: student.department,
      semester: student.semester,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      address: student.address || '',
      parentContact: student.parentContact || '',
      cgpa: student.cgpa || 0,
      attendancePercentage: student.attendancePercentage || 0,
      feeStatus: student.feeStatus,
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (data) => {
    setModalLoading(true);
    setModalError(null);
    try {
      if (editingStudent) {
        // Update
        await api.put(`/students/${editingStudent._id}`, data);
      } else {
        // Create
        await api.post('/students', data);
      }
      setShowModal(false);
      reset();
      fetchStudents();
    } catch (error) {
      setModalError(error.response?.data?.message || 'Operation failed');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and all their academic, attendance, and fee logs? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/students/${id}`);
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Deletion failed');
    }
  };

  // Convert student list to CSV and trigger download
  const handleExportCSV = async () => {
    try {
      // Fetch all students (not just this page) matching current filters
      const res = await api.get('/students', {
        params: {
          page: 1,
          limit: 10000, // retrieve all matching students
          search,
          department: deptFilter,
          semester: semFilter,
          feeStatus: feeFilter,
        },
      });

      const exportList = res.data.students;
      
      const csvHeaders = ['Student ID', 'Roll Number', 'Name', 'Email', 'Phone', 'Department', 'Semester', 'CGPA', 'Attendance %', 'Fee Status'];
      const csvRows = exportList.map((s) => [
        `"${s.studentId}"`,
        `"${s.rollNumber}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.email}"`,
        `"${s.phoneNumber || ''}"`,
        `"${s.department}"`,
        s.semester,
        s.cgpa,
        s.attendancePercentage,
        `"${s.feeStatus}"`
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `students_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV', error);
      alert('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
            Student Management Directory
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Create, view, update student credentials and personal info.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98]"
          >
            <Download size={14} />
            <span>Export to CSV</span>
          </button>
          
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Name, Roll, or Email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-slate-800 dark:bg-slate-950/60 dark:placeholder-slate-500"
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <select
            value={semFilter}
            onChange={(e) => {
              setSemFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Fee Filter */}
          <select
            value={feeFilter}
            onChange={(e) => {
              setFeeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="">All Fee Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 px-4 py-2 text-xs font-bold transition-all"
          >
            Find
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                <th className="px-6 py-4">Student ID / Roll</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Department & Sem</th>
                <th className="px-6 py-4">CGPA</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Fees</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-xs font-semibold text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/20 transition-colors">
                    {/* ID / Roll */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-outfit text-xs font-bold text-slate-800 dark:text-slate-200">
                        {student.studentId}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {student.rollNumber}
                      </div>
                    </td>

                    {/* Name / Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                          alt="Avatar"
                          className="h-8 w-8 rounded-lg object-cover ring-2 ring-brand-500/10"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {student.name}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Sem */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {student.department}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Semester {student.semester}
                      </div>
                    </td>

                    {/* CGPA */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-outfit text-xs font-black text-slate-800 dark:text-white">
                        {student.cgpa?.toFixed(2) || '0.00'}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${student.attendancePercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-outfit text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {student.attendancePercentage || 0}%
                        </span>
                      </div>
                    </td>

                    {/* Fee status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          student.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}
                      >
                        {student.feeStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination control */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total {totalStudents} Students
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 mb-6">
              <UserCheck size={20} className="text-brand-500" />
              <h2 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">
                {editingStudent ? 'Edit Student Profile' : 'Add New Student Record'}
              </h2>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
                {modalError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              {/* Row 1 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    {...register('studentId', { required: 'Student ID is required' })}
                    disabled={!!editingStudent}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 disabled:opacity-50"
                  />
                  {errors.studentId && <p className="text-[10px] text-rose-500 mt-1">{errors.studentId.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    {...register('rollNumber', { required: 'Roll Number is required' })}
                    disabled={!!editingStudent}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60 disabled:opacity-50"
                  />
                  {errors.rollNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.rollNumber.message}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Academic Email
                  </label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register('phoneNumber')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Parent Emergency Contact
                  </label>
                  <input
                    type="text"
                    {...register('parentContact')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Department
                  </label>
                  <select
                    {...register('department')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
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
                    Semester
                  </label>
                  <select
                    {...register('semester')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
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
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                />
              </div>

              {/* Row 5: CGPA, Attendance, FeeStatus */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('cgpa', { min: 0, max: 10 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Attendance (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('attendancePercentage', { min: 0, max: 100 })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-950/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Fee Status
                  </label>
                  <select
                    {...register('feeStatus')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center justify-center rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
