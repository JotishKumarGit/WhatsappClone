import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { multerMiddleware } from '../config/cloudinaryConfig.js';
import { deleteMessage, getConversation, getMessages, markAsRead, sendMessage } from '../controllers/chatController.js';

const router = express.Router();

// http://localhost:5000/api/chat/send-message
router.post('/send-message', multerMiddleware, authMiddleware, sendMessage);
// http://localhost:5000/api/chat/conversations
router.get('/conversations', authMiddleware, getConversation);
// http://localhost:5000/api/chat/conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);
// http://localhost:5000/api/chat/message/read
router.put('/message/read', authMiddleware, markAsRead);
// http://localhost:5000/api/chat/delete-message/:messageId
router.delete('/delete-message/:messageId', authMiddleware, deleteMessage);



export default router;


