const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")
const User = require('../models/userModel'); // Importing the User model
const crypto = require("crypto")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")
const Leave=require("../models/leaveRequest")
const Course=require("../models/courseModel")

const Attendance=require("../models/attandanceModel")
//register

exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password

    })
    sendToken(user, 201, res)

})

//logout
exports.logout = catchAsyncErrors(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})


//login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHander("Please Enter Email & Password", 400))

    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new ErrorHander("Invalid Email or Password", 401))
    }


    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Invalid Email or Password", 401))
    }

    sendToken(user, 200, res)

})



//register course
exports.registerCourse = catchAsyncErrors(async (req, res, next) => {
    const { courseName } = req.body;
  
    // Ensure courseName is provided
    if (!courseName) {
      return next(new ErrorHander('Please provide a course name', 400));
    }
  
    // Create the new course and associate it with the logged-in user
    const course = await Course.create({
      courseName,
      user: req.user.id,  // Assuming `req.user` contains the authenticated user's data
    });
  
    res.status(201).json({
      success: true,
      message: 'Course registered successfully',
      course,
    });
  });

//apply for leave 
exports.applyLeave = catchAsyncErrors(async (req, res, next) => {
    const { courseId, startDate, endDate } = req.body;
  
    // Validate required fields
    if (!courseId || !startDate || !endDate) {
      return next(new ErrorHander('Please provide course ID, start date, and end date', 400));
    }
  
    // Validate if the course exists for the user
    const course = await Course.findOne({ _id: courseId, user: req.user.id });
  
    if (!course) {
      return next(new ErrorHander('Course not found for this user', 404));
    }
  
    // Ensure the startDate is before endDate
    if (new Date(startDate) > new Date(endDate)) {
      return next(new ErrorHander('End date must be after the start date', 400));
    }
  
    // Create the leave application
    const leave = await Leave.create({
      duration: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      user: req.user.id, // Linking the leave to the user
      course: courseId, // Linking the leave to the specific course
      status: 'Pending', // Default leave status
    });
  
    res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      leave,
    });
  });



  // GET - Fetch the user's profile details, courses, attendance, and leave
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
    // Fetch the user by ID from the request (req.user is set by authentication middleware)
    const user = await User.findById(req.user.id);
  
    if (!user) {
      return next(new ErrorHander('User not found', 404));
    }
  
    // Fetch all the courses registered by the user
    const courses = await Course.find({ user: req.user.id });
  
    // Fetch all attendance records for the user
    const attendanceRecords = await Attendance.find({ user: req.user.id });
  
    // Fetch all leave applications for the user
    const leaveApplications = await Leave.find({ user: req.user.id });
  
    // Send back all the collected data as a response
    res.status(200).json({
      success: true,
      user,
      courses,
      attendanceRecords,
      leaveApplications,
    });
  });

//get all user (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();
  
    if (!users || users.length === 0) {
      return next(new ErrorHander('No users found', 404));
    }
  
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  });


 // PUT - Mark attendance for a user by Admin
 exports.markAttendance = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params; // User ID
    const { courseId, status, attendanceDate } = req.body; // Course ID, attendance status ('present' or 'absent'), and date
  
    // Validate input
    if (!courseId || !status || !['present', 'absent'].includes(status)) {
      return next(new ErrorHander('Please provide course ID and a valid status (present/absent)', 400));
    }
  
    // Validate if the user exists
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHander(`User not found with ID: ${id}`, 404));
    }
  
    // Validate if the course exists for the user
    const course = await Course.findOne({ _id: courseId, user: id });
    if (!course) {
      return next(new ErrorHander('Course not found for this user', 404));
    }
  
    // Use the provided attendanceDate or default to today
    const date = attendanceDate ? new Date(attendanceDate).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);
  
    // Check if an attendance record already exists for the provided date
    let attendance = await Attendance.findOne({
      user: id,
      course: courseId,
      attendanceDate: date,
    });
  
    if (!attendance) {
      // If no record exists for the provided date, create a new one
      attendance = new Attendance({
        user: id,
        course: courseId,
        attendanceDate: date,
        attendanceStatus: status,
        totalPresent: status === 'present' ? 1 : 0,
        totalAbsent: status === 'absent' ? 1 : 0,
      });
    } else {
      // Update the attendance status if a record exists
      // Handle if changing from 'present' to 'absent' or vice versa
      if (attendance.attendanceStatus !== status) {
        if (status === 'present') {
          attendance.totalPresent += 1;
          attendance.totalAbsent = attendance.totalAbsent > 0 ? attendance.totalAbsent - 1 : 0;
        } else if (status === 'absent') {
          attendance.totalAbsent += 1;
          attendance.totalPresent = attendance.totalPresent > 0 ? attendance.totalPresent - 1 : 0;
        }
      }
  
      // Update attendance status
      attendance.attendanceStatus = status;
    }
  
    // Save the updated attendance record
    await attendance.save();
  
    res.status(200).json({
      success: true,
      message: `Attendance marked as ${status} for user ${user.name} on ${new Date(date).toLocaleDateString()}`,
      attendance,
    });
  });


  //admin leave update 
  exports.updateLeave = catchAsyncErrors(async (req, res, next) => {
    
    const { id } = req.params; // User ID
    const user = await User.findById(id);
    const { leaveId, status } = req.body; // Leave ID and new status
  
    // Validate input
    if (!leaveId || !status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return next(new ErrorHander('Please provide leave ID and a valid status (Pending/Approved/Rejected)', 400));
    }
  
    // Validate if the leave request exists
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return next(new ErrorHander(`Leave request not found with ID: ${leaveId}`, 404));
    }
  
    // Validate if the leave request belongs to the user
    if (leave.user.toString() !== id) {
      return next(new ErrorHander('This leave request does not belong to the specified user', 403));
    }
  
    // Update the leave status
    leave.status = status;
  
    // Save the updated leave record
    await leave.save();
  
    res.status(200).json({
      success: true,
      message: `Leave status updated to ${status} for user ${user.name}`,
      leave
    });
  });


  // admin get user details
  exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;
  
    // Fetch the user by ID
    const user = await User.findById(userId);
  
    if (!user) {
      return next(new ErrorHander(`User does not exist with id: ${userId}`, 404));
    }
  
    // Fetch all courses registered by the user
    const courses = await Course.find({ user: userId });
  
    // Fetch all attendance records for the user
    const attendanceRecords = await Attendance.find({ user: userId });
  
    // Fetch all leave applications for the user
    const leaveApplications = await Leave.find({ user: userId });
  
    // Send back all the collected data as a response
    res.status(200).json({
      success: true,
      user,
      courses,
      attendanceRecords,
      leaveApplications,
    });
  });