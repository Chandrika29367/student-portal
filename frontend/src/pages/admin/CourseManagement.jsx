import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  UserPlus,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const DEPARTMENTS = ['Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Information Technology', 'All'];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');

  // Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseError, setCourseError] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);

  // Register Student Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [studentSearchVal, setStudentSearchVal] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const {
    register: registerCourseField,
    handleSubmit: handleCourseSubmit,
    setValue: setCourseValue,
    reset: resetCourseForm,
    formState: { errors: courseErrors },
  } = useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses', {
        params: {
          department: deptFilter,
          semester: semFilter,
        },
      });
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [deptFilter, semFilter]);

  const openAddCourseModal = () => {
    setEditingCourse(null);
    setCourseError(null);
    resetCourseForm({
      courseCode: '',
      title: '',
      credits: 3,
      department: 'Computer Science',
      semester: 1,
      description: '',
    });
    setShowCourseModal(true);
  };

  const openEditCourseModal = (course) => {
    setEditingCourse(course);
    setCourseError(null);
    resetCourseForm({
      courseCode: course.courseCode,
      title: course.title,
      credits: course.credits,
      department: course.department,
      semester: course.semester,
      description: course.description || '',
    });
    setShowCourseModal(true);
  };

  const onCourseFormSubmit = async (data) => {
    setCourseLoading(true);
    setCourseError(null);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse._id}`, data);
      } else {
        await api.post('/courses', data);
      }
      setShowCourseModal(false);
      fetchCourses();
    } catch (error) {
      setCourseError(error.response?.data?.message || 'Course operation failed');
    } finally {
      setCourseLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All student course registrations for this course will be deleted.')) {
      return;
    }

    try {
      await api.delete(`/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  // Student Search for registration
  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!studentSearchVal.trim()) return;
    
    setSearchLoading(true);
    setRegError(null);
    setFoundStudent(null);
    try {
      const res = await api.get('/students', {
        params: { search: studentSearchVal, limit: 1 },
      });
      if (res.data.students.length > 0) {
        setFoundStudent(res.data.students[0]);
      } else {
        setRegError('No student found with that ID or roll number.');
      }
    } catch (error) {
      setRegError('Error searching student.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRegister = async (courseId) => {
    if (!foundStudent) return;
    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);
    try {
      await api.post('/registrations/register', {
        studentId: foundStudent._id,
        courseIds: [courseId],
      });
      setRegSuccess(`Successfully registered student ${foundStudent.name} to this course!`);
    } catch (error) {
      setRegError(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const openRegModal = () => {
    setRegError(null);
    setRegSuccess(null);
    setFoundStudent(null);
    setStudentSearchVal('');
    setShowRegModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
            Course Management Portal
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Define subjects, manage credits, and register students.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openRegModal}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-all active:scale-[0.98]"
          >
            <UserPlus size={14} />
            <span>Enroll Student</span>
          </button>
          
          <button
            onClick={openAddCourseModal}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Filter Courses:
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.filter(d => d !== 'All').map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={semFilter}
          onChange={(e) => setSemFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>

      {/* Course List Grid */}
      {loading ? (
        <div className="flex h-48 w-full items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-xs font-semibold text-slate-400">No courses listed matching filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between hover-lift dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-outfit text-xs font-black text-brand-500 uppercase tracking-wider">
                    {course.courseCode}
                  </span>
                  <span className="rounded-lg bg-slate-50 border px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase dark:bg-slate-950 dark:border-slate-800">
                    {course.credits} Credits
                  </span>
                </div>
                <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                  {course.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {course.department} • Semester {course.semester}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                  {course.description || 'No course description available.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  ERP Code: {course._id.slice(-6)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditCourseModal(course)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-850"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => deleteCourse(course._id)}
                    className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Close */}
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
              {editingCourse ? 'Modify Course Record' : 'Create New Course'}
            </h2>

            {courseError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
                {courseError}
              </div>
            )}

            <form onSubmit={handleCourseSubmit(onCourseFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS301"
                  {...registerCourseField('courseCode', { required: 'Course Code is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                />
                {courseErrors.courseCode && <p className="text-[10px] text-rose-500 mt-1">{courseErrors.courseCode.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Database Management Systems"
                  {...registerCourseField('title', { required: 'Course Title is required' })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                />
                {courseErrors.title && <p className="text-[10px] text-rose-500 mt-1">{courseErrors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Credits
                  </label>
                  <select
                    {...registerCourseField('credits')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>
                        {c} Credits
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Semester
                  </label>
                  <select
                    {...registerCourseField('semester')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Department
                </label>
                <select
                  {...registerCourseField('department')}
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
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Course outline and syllabus summary..."
                  {...registerCourseField('description')}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseLoading}
                  className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {courseLoading ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student to Course Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            {/* Close */}
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>

            <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200 mb-4">
              Enroll Student to Course
            </h2>

            {/* Quick search input */}
            <form onSubmit={handleStudentSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Search student by Roll Number or ID..."
                value={studentSearchVal}
                onChange={(e) => setStudentSearchVal(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="rounded-xl bg-slate-800 text-white px-4 text-xs font-bold hover:bg-slate-900 dark:bg-slate-700"
              >
                {searchLoading ? 'Searching...' : 'Find'}
              </button>
            </form>

            {regError && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
                {regError}
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600">
                <CheckCircle size={14} className="shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {/* Found Student details & registration triggers */}
            {foundStudent ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={foundStudent.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundStudent.name)}`}
                      alt="Student"
                      className="h-10 w-10 rounded-xl"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {foundStudent.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Roll: {foundStudent.rollNumber} • Semester {foundStudent.semester}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Department: {foundStudent.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Registerable Semester Courses:
                  </h4>
                  {/* Selectable courses */}
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 max-h-48 overflow-y-auto">
                    {courses
                      .filter((c) => (c.department === foundStudent.department || c.department === 'All') && c.semester === foundStudent.semester)
                      .map((course) => (
                        <div key={course._id} className="flex items-center justify-between p-3">
                          <div>
                            <span className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                              {course.courseCode}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {course.title}
                            </h5>
                          </div>
                          <button
                            onClick={() => handleRegister(course._id)}
                            disabled={regLoading}
                            className="rounded-lg bg-brand-500 text-white px-3 py-1 text-[10px] font-bold hover:bg-brand-600 disabled:opacity-50"
                          >
                            Register
                          </button>
                        </div>
                      ))}
                    {courses.filter((c) => (c.department === foundStudent.department || c.department === 'All') && c.semester === foundStudent.semester).length === 0 && (
                      <p className="p-4 text-center text-xs text-slate-400">No matching semester courses defined.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
                <HelpCircle size={32} />
                <p className="text-xs font-semibold text-slate-400 mt-2">Search and select a student above.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
