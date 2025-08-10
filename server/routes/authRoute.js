import express from 'express';
import  {checkAuthenticated, getAllUsers, logout, sendOtp, updateProfile, verifyOtp} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {multerMiddleware} from '../config/cloudinaryConfig.js';

const router = express.Router();

// http://localhost:5000/api/auth/send-otp
router.post('/send-otp',   sendOtp);
// http://localhost:5000/api/auth/verify-otp
router.post('/verify-otp',  verifyOtp );
// http://localhost:5000/api/auth/logout
router.get('/logout', logout);


// protected route 
// http://localhost:5000/api/auth/update-profile
router.put('/update-profile', authMiddleware, multerMiddleware , updateProfile);
// http://localhost:5000/api/auth/check-auth
router.get('/check-auth',authMiddleware, checkAuthenticated );
// http://localhost:5000/api/auth/users
router.get('/users',authMiddleware,  getAllUsers)

export default router;

