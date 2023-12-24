const express = require("express")
const router = express.Router();
const {auth,isInstructor} = require("../middlewares/auth")
const{
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard
} = require("../controllers/Profile")


router.delete("/deleteProfile",auth,deleteAccount)
router.put("/updateProfile",auth,updateProfile)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/getUserDetails",auth,getAllUserDetails)
router.get("/getEnrolledCourses",auth,getEnrolledCourses)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

// router.put("getEnrolledCourses",auth,getEnrolledCourses)
module.exports = router
