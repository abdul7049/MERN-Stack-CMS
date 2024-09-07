const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors=require("./catchAsyncErrors")
const jwt =require("jsonwebtoken")
const User=require("../models/userModel")

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    let token;
  
    // Check if token is in cookies or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Extract token from "Bearer <token>"
    }
  
    if (!token) {
      return next(new ErrorHander('Please login to access this resource', 401));
    }
  
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
  
    if (!req.user) {
      return next(new ErrorHander('User not found', 404));
    }
  
    next();
  });

exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
           return next( new ErrorHander(`Role ${req.user.role} is not allowed to access this resource`,403))
        }
        next()
    }
}