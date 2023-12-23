const {instance} = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Course");
const mailSender = require("../utils/mailSender");
// const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");

// capture the payment and initiate the Razorpay order
exports.capturePayment =async (req,res) =>{
    // get Course id and User id
    const {course_id}  = req.body;
    const userId  = req.user.id;
    // validation
    // valid CourseId
    if(!course_id)
    {
        return res.json({
            success:false,
            message:"Please provide valid Course ID"
        })
    }
    // valid Course details
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course)
        {
            return res.json({
                success:false,
                message:"Course Not Found"
            })
        }
        // USer alredy pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(Course.studentsEnrolled.includes(uid))
        {
            return res.status(200).json({
                success:true,
                message:"Student is already enrolled | Course is Already buy"
            })
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
                success:false,
                message:e.message
        })
    }
    // order create
    const amount = course.price;
    const currency = "INR";
    const options ={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    }
    try {
        // initiate payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount 
        })
    } catch (e) {
        console.log(e);
        res.json({
            success:false,
            message:"Could not initial order"
        })
    }
    // return res
}

// verify Signature
exports.verifySignature = async (req,res)=>{
    const webhookSecret = "123456789";
    const signature = req.headers("x-razorpay-signature"); 
    const shaSum = crypto.createHmac("sha256",webhookSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");
    if(signature === digest)
    {
        console.log("Payment is Authorised");
        const {courseId,userId} = req.body.payload.payment.entity.notes;
        try {
            // fulfil the action
            // find the course and enrolled the student in it
            const enrolledCourse = await Course.findOneAndUpdate({_id:courseId},
                                                                {$push:{studentsEnrolled:userId}},
                                                                {new:true},
            );

            if(!enrolledCourse)
            {
                return res.status(500).json({
                    success:false,
                    message:"Course Not Found"
                });
            }
            console.log("🚀 ~ file: Payments.js:103 ~ exports.verifySignature= ~ enrolledCourse:", enrolledCourse)
            // find the student and add the course to their list enrolled courses me 
            const enrolledStudent = await User.findOneAndUpdate({_id:userId},
                                                                {$push:{courses:courseId}},
                                                                {new:true}
            );
            // mail send krdo confirmation wala
            const emailResponse =await mailSender(
                enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congo You are onboarded into new Codehelp Course",
            );
            console.log("🚀 ~ file: Payments.js:121 ~ exports.verifySignature= ~ emailResponse:", emailResponse)
            return res.status(200).json({
                success:true,
                message:"signature verified and Course added !!!!"
            })
            

        } catch (e) {
            console.log("🚀 ~ file: Payments.js:129 ~ exports.verifySignature= ~ e:", e)
            return res.status(500).json({
                success:false,
                message:e.message
            })
        }
    }
    else
    {
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        })
    }
}
