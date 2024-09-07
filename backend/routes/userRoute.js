const express=require("express")
const { getAllUsers, registerUser, registerCourse, logout, loginUser, applyLeave, getUserProfile, markAttendance, updateLeave, getUserDetails } = require("../controllers/usController")
const {isAuthenticatedUser,authorizeRoles}=require("../middleware/auth")
/*const { registerUser, loginUser, logout, forgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser } = require("../controllers/userController")
const {isAuthenticatedUser,authorizeRoles}=require("../middleware/auth")


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/password/forgot").post(forgetPassword)
router.route("/password/reset/:token").put(resetPassword)
router.route("/logout").get(logout)
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUser)
router.route("/admin/users/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
const{getAllUserDetails, markAttendance, updateLeaveStatus}=require("../controllers/userController")
const router=express.Router()
router.route("/getallusers").get(getAllUserDetails)
router.route("/markattendance").put(markAttendance)
router.route("/leave").put(updateLeaveStatus)
*/

const router=express.Router()
router.route("/register").post(registerUser)
router.route("/user/registerCourse").post(isAuthenticatedUser,registerCourse)
router.route("/logout").get(logout)
router.route("/user/applyLeave").post(isAuthenticatedUser,applyLeave)
router.route("/login").post(loginUser)
router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers)
router.route("/admin/user/:id/markAttendance").put(isAuthenticatedUser,authorizeRoles("admin"),markAttendance)
router.route("/user/me").get(isAuthenticatedUser,getUserProfile)

router.route("/admin/user/:id/updateLeave").put(isAuthenticatedUser,authorizeRoles("admin"),updateLeave)

router.route("/admin/user/:id").get(isAuthenticatedUser,authorizeRoles("admin"),getUserDetails)
module.exports=router