import twilloService from "../services/twilloService.js";
import generateToken from "../utills/generateToken.js";
import otpGenerate from "../utills/otpGenerator.js";
import userModel from '../models/UserModel.js';
import response from "../utills/responseHandler.js";
import sendToEmail from '../services/emailService.js';


// send otp
export const sendOtp = async (req, res) => {
    const { phoneNumber, phoneSuffix, email } = req.body;
    const otp = otpGenerate();
    const expiry = new Date(Date.now() + 5 * 60 + 1000);
    let user;
    try {
        if (email) {
            user = await userModel.findOne({ email });
            if (!user) {
                user = new userModel({ email })
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            await user.save();
            await sendToEmail(email, otp);
            return response(res, 200, 'Otp send to your email', { email });
        }
        if (!phoneNumber || !phoneSuffix) {
            return response(res, 400, 'Phone number and Phone suffix are required');
        }
        const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
        user = await userModel.findOne({ phoneNumber });
        if (!user) {
            user = await new userModel({ phoneNumber, phoneSuffix });
        }
        await twilloService.sendOtpToPhoneNumber(fullPhoneNumber);
        await user.save();

        return response(res, 200, 'Otp send successfully ', user);
    } catch (error) {
        console.log(error);
        return res.status(res, 500, 'Internal server error');
    }
}

// verify phone number otp
export const verifyOtp = async (req, res) => {
    const { phoneNumber, phoneSuffix, email, otp } = req.body;
    try {
        let user;
        if (email) {
            user = await userModel.findOne({ email });
            if (!user) {
                return response(res, 404, 'User not found');
            }
            const now = new Date();
            if (!user.emailOtp || String(user.emailOtp) !== String(otp) || now > Date(user.emailOtpExpiry)) {
                return response(res, 400, 'Invalid or expired otp');
            }
            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;
            await user.save();
        } else {
            if (!phoneNumber || !phoneSuffix) {
                return response(res, 400, 'Phone number and phone suffix is required');
            }
            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
            user = await userModel.findOne({ phoneNumber });
            if (!user) {
                return response(res, 404, 'User not found');
            }
            const result = await twilloService.verifyOtp(fullPhoneNumber, otp);
            if (result.status !== 'approved') {
                return response(res, 400, 'Invalid otp');
            }
            user.isVerified = true;
            await user.save();
        }
        const token = await generateToken(user?._id);
        res.cookie("auth_token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365
        })
        return response(res, 200, 'Otp verified successfully', { token, user });
    } catch (error) {
        console.log(error);
        return response(res, 500, 'Internal server error');
    }
}

//  update profile
export const updateProfile = async (req, res) => {
    try {
        const { username, agreed, about } = req.body;
        const userId = req.user.userId;
        const user = await userModel.findById(userId);
        const file = req.file;
        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            user.profilePicture = uploadResult?.secure_url;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }
        if (username) user.username = username;
        if (agreed) user.agreed = agreed;
        if (about) user.about = about;
        await user.save();
        return response(res, 200, 'User profile updated successfully', user);
    } catch (error) {
        console.log(error);
        return response(res, 500, 'Internal server error');
    }
}







