import twillo from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

// Twillo credentials from env

const accountSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const serviceSid = process.env.TWILLO_SERVICE_SID;


const client = twillo(accountSid, authToken);


// send otp to phone number 
const sendOtpToPhoneNumber = async (phoneNumber) => {
    try {
        console.log('sending otp to this number', phoneNumber);
        if (!phoneNumber) {
            throw new Error('Phone number is required');
        }
        const response = await client.verify.v2.services(serviceSid).verifications.create({
            to: phoneNumber,
            channel: 'sms'
        });
        console.log('This is my otp response', response);
        return response;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to send otp');
    }
}

// verify otp 
const verifyOtp = async (phoneNumber, otp) => {
    try {
        console.log("This is my otp", otp);
        console.log('This is my phone number', phoneNumber);
        const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
            to: phoneNumber,
            code: otp
        });
        console.log('This is my otp response', response);
        return response;
    } catch (error) {
        console.log(error);
        throw new Error("Otp verification fields");
    }
}

export default {sendOtpToPhoneNumber, verifyOtp};








