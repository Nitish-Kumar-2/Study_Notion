const User = require("../models/User");
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt");
//resetPasswordToken
exports.resetPasswordToken = async (req,res)=>{
    try {
        //get email from req body 
        const email = req.body.email;
        // check user for this email, email validation 
        const user = await User.findOne({email:email});
        if(!user)
        {
            return res.status(401).json({
                success:false,
                message:"YOur email is not register with us"
            }); 
        }
        //generate token
        const token = crypto.randomUUID();
        // update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{new:true});
        // create url
        const url  = `http://localhost:3000/update-password/${token}`
        // send mail containing the url
        await mailSender(email,"Password Reset Link",`Password reset Link ${url}`);
        // return response
        return res.status(200).json({
            success:true,
            message:"Check your email, reset link sent !"
        }); 
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while restting the passwrod"
        }); 
    }
}

//resetPassword
exports.resetPassword = async (req,res)=>{
    try {
        // data fetch
        const {password,confirmPassword,token} = req.body;
        //validation
        if(password !== confirmPassword)
        {
            return res.json({
                success:false,
                message:'password Not matching'
            })
        }
        //get userdetails from db using token
        const userDetails = await User.findOne({token:token});
        // if no entry -> invalid token
        if(!userDetails)
        {
            return res.json({
                success:false,
                message:'token is invalid'
            })
        }
        // token time check 
        if(userDetails.resetPasswordExpiresIn < Date.now())
        {
            return res.json({
                success:false,
                message:'token is expires , try again '
            })
        }
        // hash pass
        const  hashedPassword = await bcrypt.hash(password,10);
        // password update
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
        // return response
        return res.status(200).json({
            success:true,
            message:'passwird reset successfully'
        })

    } catch (error) {
        return res.status(500).json({
            success:true,
            message:'passwird is NOT reset successfully'
        })
    }
}