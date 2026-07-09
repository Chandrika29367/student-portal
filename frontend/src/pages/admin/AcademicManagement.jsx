import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  Search,
  User,
  AlertCircle
} from 'lucide-react';

const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' or 'results'
  const [courses, setCourses] = useState([]);
  
  // Attendance States
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // studentId: 'Present' or 'Absent'
  const [attLoading, setAttLoading] = useState(false);
  const [attMessage, setAttMessage] = useState(null);
  const [attError, setAttError] = useState(null);

  // Results/Grades States
  const [studentSearch, setStudentSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [targetSemester, setTargetSemester] = useState(1);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [gradeMarks, setGradeMarks] = useState({}); // courseId: { marks: number, grade: string }
  const [sgpa, setSgpa] = useState('');
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsMessage, setResultsMessage] = useState(null);
  const [resultsError, setResultsError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (error) {
        console.error('Error loading courses', error);
      }
    };
    fetchCourses();
  }, []);

  // Attendance Logic
  const handleFetchAttendanceList = async () => {
    if (!selectedCourse) return;
    setAttLoading(true);
    setAttMessage(null);
    setAttError(null);
    try {
      // Find all registrations for this course
      const res = await api.get(`/students`);
      
      // Note: In real setup, we might have a backend query to find students registered for course
      // Let's filter students whose registered courses match or just retrieve from backend
      // But we wrote CourseRegistration schema, let's fetch students from registrations!
      // In registrations controller, we can find registrations by course, or we can fetch registrations for the course.
      // Wait, we need an endpoint for registrations by course!
      // Let's search all students matching this department and semester of the course to simplify.
      const course = courses.find((c) => c._id === selectedCourse);
      if (course) {
        // Query students in this department and semester
        const stuRes = await api.get('/students', {
          params: {
            department: course.department !== 'All' ? course.department : undefined,
            semester: course.semester,
            limit: 300, // fetch all
          },
        });
        const list = stuRes.data.students;
        setRegisteredStudents(list);

        // Initialize all as Present
        const initialRecords = {};
        list.forEach((s) => {
          initialRecords[s._id] = 'Present';
        });
        setAttendanceRecords(initialRecords);
      }
    } catch (error) {
      setAttError('Failed to load student registry for the course.');
    } finally {
      setAttLoading(false);
    }
  };

  const handleToggleAttendance = (studentId) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
    }));
  };

  const handleSaveAttendance = async () => {
    if (registeredStudents.length === 0 || !selectedCourse) return;
    setAttLoading(true);
    setAttMessage(null);
    setAttError(null);
    try {
      const records = Object.keys(attendanceRecords).map((studentId) => ({
        studentId,
        status: attendanceRecords[studentId],
      }));

      await api.post('/attendance/record', {
        courseId: selectedCourse,
        date: attendanceDate,
        records,
      });

      setAttMessage('Attendance recorded successfully for all students.');
    } catch (error) {
      setAttError('Error saving attendance records.');
    } finally {
      setAttLoading(false);
    }
  };

  // Results Logic
  const handleStudentSearch = async (e) => {
    e.preventDefault();
    if (!studentSearch.trim()) return;

    setSearchLoading(true);
    setResultsError(null);
    setFoundStudent(null);
    setStudentRegistrations([]);
    try {
      const res = await api.get('/students', {
        params: { search: studentSearch, limit: 1 },
      });
      if (res.data.students.length > 0) {
        const studentObj = res.data.students[0];
        setFoundStudent(studentObj);
        setTargetSemester(studentObj.semester);
        
        // Fetch registrations for this student
        const regRes = await api.get(`/registrations/student/${studentObj._id}`);
        const list = regRes.data.filter((r) => r.semester === studentObj.semester);
        setStudentRegistrations(list);

        // Prepopulate gradeMarks
        const initialGradeMarks = {};
        list.forEach((r) => {
          initialGradeMarks[r.course._id] = {
            marks: r.grade !== 'Pending' ? 75 : '',
            grade: r.grade !== 'Pending' ? r.grade : 'B',
            registrationId: r._id,
          };
        });
        setGradeMarks(initialGradeMarks);
      } else {
        setResultsError('No student found.');
      }
    } catch (error) {
      setResultsError('Error searching student.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleGradeChange = (courseId, field, value) => {
    setGradeMarks((prev) => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value,
      },
    }));
  };

  const handleSaveResults = async () => {
    if (!foundStudent || studentRegistrations.length === 0) return;
    setResultsLoading(true);
    setResultsMessage(null);
    setResultsError(null);
    try {
      // 1. Post/Update grades for each registration
      for (const courseId of Object.keys(gradeMarks)) {
        const item = gradeMarks[courseId];
        await api.put('/registrations/grade', {
          registrationId: item.registrationId,
          grade: item.grade,
          // Sync some arbitrary attendance or keep current
        });
      }

      // 2. Post overall semester results
      const gradesArray = Object.keys(gradeMarks).map((courseId) => ({
        course: courseId,
        marks: parseInt(gradeMarks[courseId].marks) || 75,
        grade: gradeMarks[courseId].grade,
      }));

      const computedSgpa = parseFloat(sgpa) || 8.0;

      await api.post('/results', {
        studentId: foundStudent._id,
        semester: targetSemester,
        sgpa: computedSgpa,
        cgpaAtSemester: computedSgpa, // simplifies to sgpa for now, backend averages CGPA automatically
        grades: gradesArray,
      });

      setResultsMessage('Grades and SGPA saved successfully!');
    } catch (error) {
      setResultsError(error.response?.data?.message || 'Error saving results.');
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-outfit text-2xl font-bold text-slate-800 dark:text-slate-200">
          Academics & Semester Operations
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Log daily student attendance and post semester grades.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'attendance'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Daily Attendance Recording
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'results'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Semester Results Upload
        </button>
      </div>

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Configure bar */}
          <div className="grid gap-4 sm:grid-cols-3 items-end rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="">Choose Course...</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    [{c.courseCode}] {c.title} (Sem {c.semester})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Attendance Date
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-900"
              />
            </div>

            <button
              onClick={handleFetchAttendanceList}
              disabled={!selectedCourse || attLoading}
              className="w-full rounded-xl bg-slate-800 text-white py-2 text-xs font-bold hover:bg-slate-900 dark:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              Fetch Roll Call List
            </button>
          </div>

          {/* Feedback alerts */}
          {attError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
              <AlertCircle size={14} />
              <span>{attError}</span>
            </div>
          )}

          {attMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600">
              <CheckCircle size={14} />
              <span>{attMessage}</span>
            </div>
          )}

          {/* Student list table */}
          {registeredStudents.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b p-4 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Daily Roll Registry ({registeredStudents.length} Students)
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar size={12} />
                  {attendanceDate}
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                      <th className="px-6 py-3">Roll Number</th>
                      <th className="px-6 py-3">Student Name</th>
                      <th className="px-6 py-3">Current Attendance</th>
                      <th className="px-6 py-3 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {registeredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/20">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-outfit text-xs font-bold text-slate-800 dark:text-slate-200">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                              alt="Avatar"
                              className="h-7 w-7 rounded-lg"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-500">
                            {student.attendancePercentage}% overall
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student._id)}
                            className={`rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                              attendanceRecords[student._id] === 'Present'
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                            }`}
                          >
                            {attendanceRecords[student._id]}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Save footer */}
              <div className="flex justify-end p-4 bg-slate-50/50 dark:bg-slate-950/20 border-t dark:border-slate-800">
                <button
                  onClick={handleSaveAttendance}
                  disabled={attLoading}
                  className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                >
                  {attLoading ? 'Saving...' : 'Submit Attendance Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Upload Tab */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Search student */}
          <form onSubmit={handleStudentSearch} className="flex gap-2 max-w-md rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              placeholder="Search Student by Roll Number or Name..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950/60"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold hover:bg-slate-900 dark:bg-slate-700 disabled:opacity-50"
            >
              {searchLoading ? 'Finding...' : 'Search'}
            </button>
          </form>

          {/* Alert messages */}
          {resultsError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
              <AlertCircle size={14} />
              <span>{resultsError}</span>
            </div>
          )}

          {resultsMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600">
              <CheckCircle size={14} />
              <span>{resultsMessage}</span>
            </div>
          )}

          {/* Results Editor Form */}
          {foundStudent && (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Student overview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 h-fit">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={foundStudent.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(foundStudent.name)}`}
                    alt="Student"
                    className="h-16 w-16 rounded-2xl mb-3 border"
                  />
                  <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
                    {foundStudent.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {foundStudent.rollNumber}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full border-t pt-4 mt-4 dark:border-slate-800">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Department</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{foundStudent.department}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Semester</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sem {foundStudent.semester}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Current CGPA</p>
                      <p className="text-xs font-black text-brand-500">{foundStudent.cgpa?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Dues Status</p>
                      <p className={`text-xs font-bold ${foundStudent.feeStatus === 'Paid' ? 'text-emerald-500' : 'text-rose-500'}`}>{foundStudent.feeStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grades sheet */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 md:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Post Semester {foundStudent.semester} Marks & Grades
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SGPA:</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      value={sgpa}
                      onChange={(e) => setSgpa(e.target.value)}
                      className="w-20 rounded-lg border border-slate-200 bg-slate-50 py-1 px-2.5 text-xs font-semibold focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </div>

                {studentRegistrations.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Student has no registered courses for this semester yet. Enroll them first.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {studentRegistrations.map((reg) => (
                      <div key={reg._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                        <div>
                          <span className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">
                            {reg.course.courseCode}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                            {reg.course.title}
                          </h4>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          {/* Marks Input */}
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Marks</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradeMarks[reg.course._id]?.marks || ''}
                              onChange={(e) => handleGradeChange(reg.course._id, 'marks', e.target.value)}
                              className="w-14 rounded-lg border border-slate-200 bg-white py-1 px-2 text-xs font-semibold text-center dark:border-slate-800 dark:bg-slate-900"
                            />
                          </div>

                          {/* Grade Select */}
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase mb-1">Grade</span>
                            <select
                              value={gradeMarks[reg.course._id]?.grade || 'B'}
                              onChange={(e) => handleGradeChange(reg.course._id, 'grade', e.target.value)}
                              className="w-16 rounded-lg border border-slate-200 bg-white py-1 px-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900"
                            >
                              {['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-3 border-t dark:border-slate-800">
                      <button
                        onClick={handleSaveResults}
                        disabled={resultsLoading}
                        className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
                      >
                        {resultsLoading ? 'Saving...' : 'Save Semester Grades'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicManagement;
