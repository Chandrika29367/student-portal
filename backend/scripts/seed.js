const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const CourseRegistration = require('../models/CourseRegistration');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Notice = require('../models/Notice');

dotenv.config();

const firstNames = [
  'Arjun', 'Aditya', 'Neha', 'Rohan', 'Priya', 'Aarav', 'Ananya', 'Rahul', 'Sneha', 'Vijay',
  'Karan', 'Amit', 'Divya', 'Siddharth', 'Ishita', 'Riya', 'Vikram', 'Rajesh', 'Suresh', 'Manish',
  'Kiran', 'Deepak', 'Sanjay', 'Sunita', 'Geeta', 'Anil', 'Nikhil', 'Pooja', 'Shweta', 'Abhishek',
  'Varun', 'Kriti', 'Tushar', 'Meera', 'Ravi', 'Simran', 'Akash', 'Shruti', 'Vivek', 'Tanvi'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Mehra', 'Reddy', 'Rao',
  'Nair', 'Choudhury', 'Iyer', 'Sen', 'Das', 'Roy', 'Banerjee', 'Mishra', 'Pandey', 'Saxena',
  'Deshmukh', 'Kulkarni', 'Bose', 'Dutta', 'Shah', 'Mehta', 'Trivedi', 'Naidu', 'Shetty', 'Pillai'
];

const departments = [
  'Computer Science',
  'Electrical',
  'Mechanical',
  'Civil',
  'Information Technology'
];

const deptCodes = {
  'Computer Science': 'CS',
  'Electrical': 'EE',
  'Mechanical': 'ME',
  'Civil': 'CE',
  'Information Technology': 'IT'
};

const coursesData = [
  // Computer Science
  { courseCode: 'CS101', title: 'Introduction to Programming', credits: 3, department: 'Computer Science', semester: 1, description: 'Learn logic, syntax, variables and basics of C++/Python.' },
  { courseCode: 'CS201', title: 'Data Structures and Algorithms', credits: 4, department: 'Computer Science', semester: 3, description: 'Stacks, Queues, Linked Lists, Trees, Graphs, Sorting and Searching.' },
  { courseCode: 'CS301', title: 'Database Management Systems', credits: 4, department: 'Computer Science', semester: 5, description: 'Relational databases, SQL, Normalization, Transactions, and indexing.' },
  { courseCode: 'CS401', title: 'Artificial Intelligence', credits: 3, department: 'Computer Science', semester: 7, description: 'Heuristic Search, Machine Learning, Neural Networks, and NLP.' },
  
  // Electrical
  { courseCode: 'EE101', title: 'Basic Electrical Engineering', credits: 3, department: 'Electrical', semester: 1, description: 'AC/DC circuits, transformers, and electrical machines fundamentals.' },
  { courseCode: 'EE201', title: 'Network Analysis & Synthesis', credits: 4, department: 'Electrical', semester: 3, description: 'Two port networks, Laplace transforms, filters, and network theorems.' },
  { courseCode: 'EE301', title: 'Control Systems', credits: 4, department: 'Electrical', semester: 5, description: 'Feedback control, transfer functions, stability, Root Locus, Bode plots.' },
  { courseCode: 'EE401', title: 'Power Systems Engineering', credits: 4, department: 'Electrical', semester: 7, description: 'Transmission lines, fault analysis, switchgear, and protection.' },
  
  // Mechanical
  { courseCode: 'ME101', title: 'Engineering Mechanics', credits: 3, department: 'Mechanical', semester: 2, description: 'Coplanar forces, trusses, friction, centroids, and moment of inertia.' },
  { courseCode: 'ME201', title: 'Thermodynamics', credits: 4, department: 'Mechanical', semester: 4, description: 'Laws of thermodynamics, entropy, pure substances, and power cycles.' },
  { courseCode: 'ME301', title: 'Heat & Mass Transfer', credits: 4, department: 'Mechanical', semester: 6, description: 'Conduction, convection, radiation, heat exchangers, and diffusion.' },
  { courseCode: 'ME401', title: 'CAD/CAM Systems', credits: 3, department: 'Mechanical', semester: 8, description: 'Computer aided design, solid modeling, CNC programming, and automation.' },
  
  // Civil
  { courseCode: 'CE101', title: 'Introduction to Civil Engineering', credits: 3, department: 'Civil', semester: 2, description: 'Overview of materials, surveying, structural design, and construction.' },
  { courseCode: 'CE201', title: 'Strength of Materials', credits: 4, department: 'Civil', semester: 4, description: 'Stresses, strains, shear force, bending moments, and deflection of beams.' },
  { courseCode: 'CE301', title: 'Structural Analysis', credits: 4, department: 'Civil', semester: 6, description: 'Indeterminate structures, energy methods, moving loads, and influence lines.' },
  { courseCode: 'CE401', title: 'Concrete Technology', credits: 4, department: 'Civil', semester: 8, description: 'Properties of concrete ingredients, mix design, fresh and hardened concrete.' },
  
  // Information Technology
  { courseCode: 'IT101', title: 'Web Programming Fundamentals', credits: 3, department: 'Information Technology', semester: 1, description: 'HTML5, CSS3, JavaScript, DOM manipulation, responsive layouts.' },
  { courseCode: 'IT201', title: 'Computer Networks', credits: 4, department: 'Information Technology', semester: 3, description: 'OSI model, TCP/IP, routing protocols, socket programming.' },
  { courseCode: 'IT301', title: 'Software Engineering', credits: 3, department: 'Information Technology', semester: 5, description: 'SDLC models, agile practices, requirements engineering, design, testing.' },
  { courseCode: 'IT401', title: 'Cloud Computing', credits: 3, department: 'Information Technology', semester: 7, description: 'Virtualization, AWS/Azure overview, containerization with Docker/Kubernetes.' }
];

const seedData = async () => {
  try {
    // 1. Clear database
    console.log('Clearing database...');
    await User.deleteMany();
    await Student.deleteMany();
    await Course.deleteMany();
    await CourseRegistration.deleteMany();
    await Fee.deleteMany();
    await Result.deleteMany();
    await Attendance.deleteMany();
    await Notice.deleteMany();

    // 2. Insert Admin User
    console.log('Creating Admin account...');
    const adminUser = await User.create({
      username: 'admin',
      password: 'adminpassword',
      role: 'admin',
      studentId: null
    });

    // 3. Insert Courses
    console.log('Inserting 20 courses...');
    const createdCourses = await Course.insertMany(coursesData);
    console.log(`Successfully inserted ${createdCourses.length} courses.`);

    // 4. Generate 300 Students
    console.log('Generating 300 sample students...');
    const studentsList = [];
    const usersList = [];

    const rollCounters = { CS: 1, EE: 1, ME: 1, CE: 1, IT: 1 };

    for (let i = 1; i <= 300; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fn} ${ln}`;
      
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const deptCode = deptCodes[dept];
      const semester = Math.floor(Math.random() * 8) + 1; // Sem 1 to 8

      const studentId = `STU2026${String(i).padStart(3, '0')}`;
      const count = rollCounters[deptCode]++;
      const rollNumber = `26${deptCode}${String(count).padStart(3, '0')}`;
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.${i}@university.edu`;
      
      // Random details
      const phoneDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
      const phoneNumber = `+91${phoneDigits}`;
      const parentPhoneDigits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
      const parentContact = `+91${parentPhoneDigits}`;
      
      // Age matching semester
      const startYear = 2008 - Math.floor(semester / 2);
      const dob = new Date(`${startYear}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`);

      const address = `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 30) + 1}, New Delhi, India`;
      
      // Profile avatar url
      const profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const cgpa = parseFloat((6.0 + Math.random() * 3.8).toFixed(2)); // 6.0 to 9.8
      const attendancePercentage = parseFloat((70 + Math.random() * 28).toFixed(2)); // 70% to 98%
      const feeStatus = Math.random() > 0.25 ? 'Paid' : 'Pending';

      studentsList.push({
        studentId,
        rollNumber,
        name,
        email,
        phoneNumber,
        department: dept,
        semester,
        dateOfBirth: dob,
        address,
        parentContact,
        profilePicture,
        cgpa,
        attendancePercentage,
        feeStatus
      });
    }

    // Insert Student Documents
    const createdStudents = await Student.insertMany(studentsList);
    console.log(`Successfully created ${createdStudents.length} students.`);

    // 5. Create student users, registrations, fees, and results
    console.log('Seeding course registrations, user accounts, results, and fee records (this may take a few seconds)...');

    const courseRegsToInsert = [];
    const feesToInsert = [];
    const resultsToInsert = [];
    const attendanceLogsToInsert = [];

    // Helper grade arrays
    const gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];

    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];

      // Add to users list
      usersList.push({
        username: student.rollNumber,
        password: 'password123', // Will trigger pre-save hashing
        role: 'student',
        studentId: student._id
      });

      // Find courses for this student's department and semester
      const semCourses = createdCourses.filter(
        (c) => (c.department === student.department || c.department === 'All') && c.semester === student.semester
      );

      // 1. Current Semester Registrations
      semCourses.forEach((c) => {
        const studentCourseAttendance = parseFloat((70 + Math.random() * 30).toFixed(2));
        courseRegsToInsert.push({
          student: student._id,
          course: c._id,
          semester: student.semester,
          grade: 'Pending',
          attendance: studentCourseAttendance
        });

        // Mock recent attendance logs for this course (last 10 days)
        for (let day = 1; day <= 10; day++) {
          const isPresent = Math.random() * 100 < studentCourseAttendance;
          const logDate = new Date();
          logDate.setDate(logDate.getDate() - day);
          logDate.setUTCHours(0, 0, 0, 0);

          attendanceLogsToInsert.push({
            student: student._id,
            course: c._id,
            date: logDate,
            status: isPresent ? 'Present' : 'Absent'
          });
        }
      });

      // 2. Fees Record for Current Semester
      const feeAmount = 65000;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);
      const isPaid = student.feeStatus === 'Paid';
      const paidDate = isPaid ? new Date() : undefined;
      const transactionId = isPaid ? `TXN${Date.now()}${String(i).padStart(3, '0')}` : undefined;

      feesToInsert.push({
        student: student._id,
        semester: student.semester,
        amount: feeAmount,
        status: student.feeStatus,
        dueDate,
        paidDate,
        transactionId
      });

      // 3. Results for PREVIOUS semesters (Sem 1 to current - 1)
      if (student.semester > 1) {
        let runningCgpa = 0;
        let semCount = 0;

        for (let sem = 1; sem < student.semester; sem++) {
          const prevCourses = createdCourses.filter(
            (c) => (c.department === student.department || c.department === 'All') && c.semester === sem
          );

          if (prevCourses.length > 0) {
            const gradesList = prevCourses.map((c) => {
              const mark = Math.floor(55 + Math.random() * 45); // 55 to 100
              let grade = 'C';
              if (mark >= 90) grade = 'A+';
              else if (mark >= 80) grade = 'A';
              else if (mark >= 70) grade = 'B+';
              else if (mark >= 60) grade = 'B';
              else if (mark >= 50) grade = 'C+';
              
              return {
                course: c._id,
                marks: mark,
                grade
              };
            });

            // Calculate SGPA for this sem
            const sgpa = parseFloat((6.5 + Math.random() * 3.3).toFixed(2));
            runningCgpa += sgpa;
            semCount++;
            const cgpaAtSem = parseFloat((runningCgpa / semCount).toFixed(2));

            resultsToInsert.push({
              student: student._id,
              semester: sem,
              sgpa,
              cgpaAtSemester: cgpaAtSem,
              grades: gradesList
            });
          }
        }
      }
    }

    // Insert User Documents
    console.log('Inserting Student User Accounts...');
    // We insert user accounts one-by-one or in chunks because the Mongoose pre-save hook for password hashing
    // is NOT executed on User.insertMany() by default (or needs config).
    // So let's write custom loop or bulk save to trigger hooks properly.
    // Loop through usersList and User.create to ensure password hashing.
    // To speed up, we can do Promise.all chunks of size 50.
    const chunkSize = 50;
    for (let c = 0; c < usersList.length; c += chunkSize) {
      const chunk = usersList.slice(c, c + chunkSize);
      await Promise.all(chunk.map(user => User.create(user)));
    }
    console.log(`User accounts created.`);

    // Bulk inserts for registrations, fees, results, and attendance
    console.log('Inserting Course Registrations...');
    await CourseRegistration.insertMany(courseRegsToInsert);

    console.log('Inserting Fee invoices...');
    await Fee.insertMany(feesToInsert);

    console.log('Inserting Academic Results...');
    await Result.insertMany(resultsToInsert);

    console.log('Inserting Attendance Logs...');
    // Log count can be up to 3000 (300 students * 10 logs), insert in small chunks to avoid memory limit
    await Attendance.insertMany(attendanceLogsToInsert);

    // 6. Notices
    console.log('Creating general academic notices...');
    const noticesList = [
      {
        title: 'End Semester Examinations Schedule Out',
        content: 'The end-semester practical and theoretical examinations schedule for all departments has been published on the bulletin board. Exams commence from August 10, 2026. Make sure to download your admit card.',
        targetDepartment: 'All',
        targetSemester: 0,
        publishedBy: adminUser._id
      },
      {
        title: 'Fee Payment Deadline Reminder',
        content: 'Students who have not paid their registration fees for the current semester must clear their outstanding dues before July 25, 2026 to avoid a late fee penalty.',
        targetDepartment: 'All',
        targetSemester: 0,
        publishedBy: adminUser._id
      },
      {
        title: 'Placement Workshop for CS/IT 7th Semester',
        content: 'A mandatory technical training and resume building workshop is organized by the Training and Placement Cell on July 15, 2026 at Seminar Hall 1.',
        targetDepartment: 'Computer Science',
        targetSemester: 7,
        publishedBy: adminUser._id
      },
      {
        title: 'Electrical Machines Lab Renovation Notice',
        content: 'Please note that the Electrical Machines Laboratory will remain closed for maintenance until July 12, 2026. All scheduled classes are moved to Lab 3.',
        targetDepartment: 'Electrical',
        targetSemester: 0,
        publishedBy: adminUser._id
      },
      {
        title: 'Internship Opportunities at L&T',
        content: 'Larsen & Toubro is hiring summer interns from the Civil and Mechanical Engineering departments (5th and 7th Semester). Register at the T&P portal.',
        targetDepartment: 'Mechanical',
        targetSemester: 5,
        publishedBy: adminUser._id
      }
    ];

    await Notice.insertMany(noticesList);

    console.log('--- SEEDING COMPLETED SUCCESSFULY ---');
    console.log(`Admin Username: admin  | Admin Password: adminpassword`);
    console.log(`Sample Student Roll: ${createdStudents[0].rollNumber} | Password: password123`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

connectDB().then(() => seedData());
