const ErrorHander = require("../utils/errorhander")
const catchAsyncErrors = require("../middleware/catchAsyncErrors")

const User = require("../models/userModel");
const crypto = require("crypto")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail")

const Course = require('../models/courseModel')
const Attandance = require('../models/attandanceModel')
const Leave = require('../models/leaveRequest')
//Register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password

    })
    sendToken(user, 201, res)

})


// login user 
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


//logout user 
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


//forget password 

exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHander("User Not found", 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\n If you have not requested this email then please ignore it.`;

    try {
        await sendEmail({
            email: user.email, // Corrected typo: "emil" was mistakenly written instead of "email"
            subject: `Ecommerce Password Recovery`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorHander(error.message, 500));
    }

});


//reset password 

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHander("Reset Password tokken is invalid or has been expired ", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHander("Password doesnot matched", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res)
})

// get user detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user
    })

})


//update user password 
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHander("Old Password is incorrect", 400))
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHander("Passwor doesnot match", 400))
    }
    user.password = req.body.newPassword
    await user.save()
    sendToken(user, 200, res)

})



//update user profile 
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {


    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    //update cloudinary later
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    res.status(200).json({
        success: true
    })

})

//get all users (admin)
exports.getAllUserDetails = catchAsyncErrors(async (req, res, next) => {

    const users = await User.find().lean(); // .lean() converts to plain JavaScript objects
    if (!users) {
        return next(new ErrorHander(`Failed to fetch user details`, 500))
    }
    const userDetails = await Promise.all(
        users.map(async (user) => {
            // Fetch courses, attendance, and leaves for the current user
            const courses = await Course.find({ user: user._id });
            const attendances = await Attandance.find({ user: user._id });
            const leaves = await Leave.find({ user: user._id });

            // Merge the user data with associated courses, attendances, and leaves
            return {
                ...user,
                courses,
                attendances,
                leaves,
            };
        })
    );
    res.status(200).json({
        success: true,
        data: userDetails,
    })
})

//controller to mark attandance
exports.markAttendance = catchAsyncErrors(async (req, res, next) => {
    const { userId, totalPresent, totalAbsent } = req.body;
  
    // Validate inputs
    if (!userId || typeof totalPresent !== 'number' || typeof totalAbsent !== 'number') {
      return next(new ErrorHander("Invalid input", 400));
    }
  
    // Create or update attendance record
    const attendance = await Attandance.findOneAndUpdate(
      { user: userId, attandanceDate: new Date().toISOString().split("T")[0] },
      { totalPresent, totalAbsent },
      { new: true, upsert: true }  // Create if not exists
    );
  
    res.status(200).json({
      success: true,
      data: attendance,
    });
  });


  // update leave
  exports.updateLeaveStatus = catchAsyncErrors(async (req, res, next) => {
    const { userId, leaveId, status } = req.body;
  
    // Validate inputs
    if (!userId || !leaveId || !["Approved", "Rejected"].includes(status)) {
      return next(new ErrorHander("Invalid input or status", 400));
    }
  
    // Find leave document based on userId and leaveId
    const leave = await Leave.findOneAndUpdate(
      { _id: leaveId, user: userId },
      { status },
      { new: true }
    );
  
    if (!leave) {
      return next(new ErrorHander("Leave not found for the given user", 404));
    }
  
    res.status(200).json({
      success: true,
      data: leave,
    });
  });
  
//get all single users (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new ErrorHander(`User does not exist with id : ${req.params.id}`))
    }


    res.status(200).json({
        success: true,
        users
    })
})


