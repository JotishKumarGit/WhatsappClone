import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import statusModel from '../models/StatusModel.js';
import response from "../utills/responseHandler.js";
import messageModel from "../models/MessageModel.js";

// Create new status

export const createStatus = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const userId = req.user > userId;

        let mediaUrl = null;
        let finalContentType = contentType || 'text';

        // handle file upload

        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);
            if (!uploadFile?.secure_url) {
                return response(res, 400, { message: 'File upload failed' });
            }
            mediaUrl = uploadFile?.secure_url;

            if (file.mimetype.startsWith('image')) {
                finalContentType = 'image';
            } else if (file.mimetype.startsWith('video')) {
                finalContentType = 'video';
            } else {
                return response(res, 400, { message: 'Unsupported file type' });
            }
        } else if (file.mimetype.startsWith('text')) {
            finalContentType = 'text';
        } else {
            return response(res, 400, { message: 'Message content is required' });
        }

        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 24); // Set expiration to 24 hours from now

        const newStatus = new statusModel({
            user: userId,
            content: mediaUrl || content,
            contentType: finalContentType, imageOrVideoUrl, messageStatus
        });

        await newStatus.save();

        const populateStatus = await messageModel.findOne(newStatus?.id).populate('user', 'username profilePicture').populate('viewers', 'username profilePicture');

        response(res, 201, { message: 'New Status created successfully', status: populateStatus });

    } catch (error) {
        console.log(error);
        response(res, 500, { message: 'Internal server error' });
    }
}

// Get status
export const getStatus = async (req, res) => {
    try {
        const status = await statusModel.find({
            expireAt: { $gt: new Date() },
        }).populate('user', 'username profilePicture').populate('viewers', 'username profilePicture').sort({ createdAt: -1 });
        return response(res, 200, 'status retrieved successfully', status);

    } catch (error) {
        console.log(error);
        response(res, 500, 'Internal server error');
    }
}

// view status 
export const viewStatus = async (req, res) => {
    try {
        const statusId = req.params;
        const userId = req.user.userId;

        const status = await statusModel.findById(statusId);
        if (!status) {
            return response(res, 404, 'Status not found');
        }
        if (!status.viewers.includes(userId)) {
            status.viewers.push(userId);
            await status.save();
            const updateStatus = await statusModel.findById(statusId).populate('user', 'username profilePicture').populate('viewers', 'username profilePicture');
        } else {
            console.log('User has already viewed this status');
        }

        return response(res, 200, 'Status viewed successfully', updateStatus);
    } catch (error) {
        console.log(error);
        return response(res, 500, 'Internal server error');
    }
}

// delete status

export const deleteStatus = async (req, res) => {
    try {
        const statusId = req.params;
        const userId = req.user.userId;

        const status = await statusModel.findById(statusId);
        if (!status) {
            return response(res, 404, 'Status not found');
        }

        if (status.user.toString() !== userId) {
            return response(res, 403, 'You are not authorized to delete this status');
        }
        await statusModel.deleteOne({ _id: statusId });
        return response(res, 200, 'Status deleted successfully');
 
    } catch (error) {
        console.log(error);
        return response(res, 500, 'Internal server error');
    }
}

