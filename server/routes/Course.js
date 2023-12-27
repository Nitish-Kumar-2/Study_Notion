const express = require("express")
const router = express.Router();
const {auth,isAdmin,isStudent,isInstructor} = require("../middlewares/auth")
const{
    getAllRating,
    createRating,
    getAverageRating
} = require("../controllers/RatingAndReview")

const {
    createCourse,
    getCourseDetails,
    getAllCourses,
    editCourse,
    deleteCourse,
    getInstructorCourses,
    getFullCourseDetails,
} = require("../controllers/Course")
const {
    // showAllCategory,
    createCategory,
    categoryPageDetails,
    showAllCategories,
} = require("../controllers/Category")
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section")
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
  } = require("../controllers/Subsection")
  
const {updateCourseProgress} = require("../controllers/courseProgress")
router.post("/createCategory",auth,isAdmin,createCategory)
router.post("/createCourse", auth, isInstructor, createCourse)
router.post("/editCourse", auth, isInstructor, editCourse)
router.delete("/deleteCourse", deleteCourse)


router.post("/getCourseDetails", getCourseDetails)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
router.get("/getAllCourses,", getAllCourses)

router.post("/addSection", auth, isInstructor, createSection)
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

router.post("/addSubSection", auth, isInstructor,createSubSection)
router.post("/updateSubSection", auth, isInstructor,updateSubSection)
router.post("/deleteSubSection", auth, isInstructor,deleteSubSection)

router.get("/showAllCategories",showAllCategories)
router.post("/getCategoryPageDetails",categoryPageDetails)
router.post("/createRating",auth,isStudent,createRating)
router.get("/getAverageRating",getAverageRating)
router.get("/getReviews",getAllRating)
router.post("/updateCourseProgress",auth,isStudent,updateCourseProgress)
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)
module.exports = router
