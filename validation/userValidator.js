const joi = require('joi');

    const registerSchema = joi.object({
        name: joi.string().min(3).max(30).required(),
        phone: joi.string().min(3).max(12).required(),
        password: joi.string().min(6).max(255).required(),
        email: joi.string().email().required()
    });   

    const loginSchema = joi.object({
        phone: joi.string().min(3).max(12).required(),
        password: joi.string().min(6).max(255).required(),
    });

    const otpSchema = joi.object({
        phone: joi.string().min(3).max(12).required(),
        otp: joi.string().min(6).max(6).required()
    });

    const resendOtpSchema = joi.object({
        phone: joi.string().min(3).max(12).required()
    });


module.exports = {
    registerSchema
    , loginSchema
    , otpSchema
    , resendOtpSchema


}