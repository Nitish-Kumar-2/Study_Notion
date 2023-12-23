const express = require("express")
const router = express.Router();
const {auth} = require("../middlewares/auth")
const{
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses
} = require("../controllers/Profile")


router.delete("/deleteProfile",auth,deleteAccount)
router.put("/updateProfile",auth,updateProfile)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/getUserDetails",auth,getAllUserDetails)
router.get("/getEnrolledCourses",auth,getEnrolledCourses)
// router.put("getEnrolledCourses",auth,getEnrolledCourses)
module.exports = router
