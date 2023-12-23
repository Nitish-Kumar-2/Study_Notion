const RatingAndReviews = require("../models/RatingAndReviews")
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create Rating
exports.createRating = async (req,res)=>{
    try {
        
    
    // get user id
    const userId = req.user.id;
    // fetchdata from req body
    const {rating,review,courseId} = req.body;
    // check if user is enrolled or not
    const courseDetails = await Course.findOne({_id:courseId,studentsEnrolled:{$elemMatch:{$eq:userId}},});
    if(!courseDetails)
    {
        return res.status(404).json({
            success:false,
            message:"Student is enrolled in the course"
        })
    }
    // check if user already reviewed the course
    const alreadyReviewed = await RatingAndReviews.findOne({user:userId,course:courseId})
    if(alreadyReviewed)
    {
        return res.status(403).json({
            success:false,
            message:"Student is already review the course"
        })
    }
    // create rating/review
    const ratingReview = await RatingAndReviews.create({
        rating,review,course:courseId,user:userId,
    });
    // update course with rating and reveiws
    const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push:{
                                            ratingAndReviews:ratingReview._id,

                                        }
                                    },{new:true});
    console.log("🚀 ~ file: RatingAndReview.js:43 ~ exports.createRating= ~ updatedCourseDetails:", updatedCourseDetails)

    return res.status(200).json({
        success:true,
        message:"Rating and review created successfully",
        ratingReview,
    })
    
    } catch (e) {
        console.log("🚀 ~ file: RatingAndReview.js:51 ~ exports.createRating= ~ e:", e)
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}

// get AverageRating
exports.getAverageRating = async (req,res)=>{
    try {
        // get course id
        const courseId = req.body.courseid;

        // calculate average rating
        const result = await RatingAndReviews.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        // return rating
        if(result.length >0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        return res.status(200).json({
            success:true,
            message:"Average rating is 0, no ratings given till now",
            averageRating:0,
        })
        
    } catch (e) {
        console.log("🚀 ~ file: RatingAndReview.js:65 ~ exports.getAverageRating= ~ e:", e)
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}

// get allRating
exports.getAllRating = async (req,res)=>{
    try {
        const allReviews = await RatingAndReviews.find({}).sort({rating:"desc"})
                                                                .populate({
                                                                    path:"user",
                                                                    select:"firstName lastName email image",
                                                                })
                                                                .populate({
                                                                    path:"course",
                                                                    select:"courseName",
                                                                })
                                                                .exec();
    return res.status(200).json({
        success:true,
        message:"All reviewed are fetched successfully",
        data:allReviews,
    })                                                            
    } catch (e) {
        console.log("🚀 ~ file: RatingAndReview.js:108 ~ exports.getAllRating= ~ e:", e)
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}