const express = require("express")
const router = express.Router();
const {auth,isInstructor,isStudent,isAdmin} = require("../middlewares/auth")
const{
    capturePayment,
    verifySignature,
} = require("../controllers/Payments")


router.post("/capturePayment",auth,isStudent,capturePayment)
router.post("/verifySignature",verifySignature)
module.exports = router
