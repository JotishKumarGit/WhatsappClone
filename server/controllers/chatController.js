import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import ConversationModel from "../models/ConversationModel.js";
import response from "../utills/responseHandler.js";
import Message from "../models/MessageModel.js";

// api to send a message
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content, messageStatus } = req.body;
        const file = req.file;
        const participants = [senderId, receiverId].sort();
        // check if conversation is already exists 
        let conversation = await ConversationModel.findOne({ participants : participants });
        if (!conversation) {
            conversation = new ConversationModel({ participants });
            await conversation.save();
        }
        let imageOrVideoUrl = null;
        let contentType = null;
        // handle file upload 
        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);
            if (!uploadFile?.secure_url) {
                return response(res, 400, "fields to upload media");
            }
            imageOrVideoUrl = uploadFile?.secure_url;
            if (!file.mimetype.startWith('image')) {
                contentType = 'image'
            } else if (file.mimetype.startWith('video')) {
                contentType = 'video'
            } else {
                return response(res, 400, 'Unsupported file type')
            }
        } else if (content?.trim()) {
            contentType = 'text';
        } else {
            return response(res, 400, 'Message content is required');
        }
        const message = new Message({
            conversation: conversation?._id,
            sender: senderId,
            receiver: receiverId,
            content,
            contentType,
            imageOrVideoUrl,
        });

        await message.save();
        if (message?.content) {
            conversation.lastMessage = message?.id
        }
        conversation.unreadCount += 1;
        await conversation.save();

        const populateMessage = await Message.findById(message?._id).populate('sender', 'username profilePicture').populate('receiver', 'username profilePicture');
        return response(res, 201, 'Message sent successfully', populateMessage);

    } catch (error) {
        console.error("Error in sendMessage:", error);
        return response(res, 500, 'Internal server error');
    }
}

// api get all conversation

export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const conversation = await ConversationModel.find({
            participants: userId,
        }).populate('participants', 'username profilePicture').populate({ path: 'sender receiver', select: 'username profilePicture' }).sort({ updatedAt: -1 });
        return response(res, 201, 'Conversations get successfully ', conversation);
    } catch (error) {
        console.error("Error in getMessage:", error);
        return response(res, 500, 'Internal server error');
    }
}

// get message of specific conversation

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const conversation = await ConversationModel.findById({ conversationId });
        if (!conversation) {
            return response(res, 404, 'Conversation not found');
        }
        if (!conversation.participants.includes(userId)) {
            return response(res, 403, 'You are not authorized to view this conversation');
        }
        const messages = await Message.find({ conversation: conversationId }).populate('sender', 'username profilePicture').populate('receiver', 'username profilePicture').sort({ createdAt });
        await Message.updateMany(
            {
                conversation: conversationId,
                receiver: userId,
                messageStatus: { $in: ["send", "delivered"] },
            },
            { $set: { messageStatus: "read" } }
        );

        conversation.unreadCount = 0;
        await conversation.save();

        return response(res, 200, 'Message retrieved successfully', messages);
    } catch (error) {
        console.log('Error in getMessages:', error);
        return response(res, 500, 'Internal server error');
    }
}

// instant mark as read using socket io 

export const markAsRead = async (req, res) => {
    try {
        const { messageIds } = req.body;
        const userId = req.user._id;

        // get relevant message to determine senders 
        let messages = await Message.find({ _id: { $in: messageIds }, receiver: userId });

        await Message.updateMany({
            _id: { $in: messageIds }, receiver: userId,
        },
            { $set: { messageStatus: "read" } }
        );
        return response(res, 200, 'Messages marked as read ', messages);

    } catch (error) {
        console.log('Error in markAsRead:', error);
        return response(res, 500, 'Internal server error');
    }
}

// api to delete message

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;

        // find the message
        const message = await Message.findById(messageId);
        if (!message) {
            return response(res, 404, 'Message not found');
        }
        // Check if the user is the sender
        if (message.sender.toString() !== userId) {
            return response(res, 403, 'You are not authorized to delete this message');
        }
        // Delete the message
        await Message.findByIdAndDelete(messageId);
        return response(res, 200, 'Message deleted successfully');
    } catch (error) {
        console.log('Error in deleteMessage:', error);
        return response(res, 500, 'Internal server error');
    }
}


