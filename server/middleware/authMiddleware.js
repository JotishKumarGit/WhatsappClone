import jwt from 'jsonwebtoken';
import response from '../utills/responseHandler.js';

const authMiddleware = (req, res, next) => {
    try {
        const authToken = req.cookies?.auth_token;
        if (!authToken) {
            return response(res, 401, 'Authorization token missing');
        }

        const decode = jwt.verify(authToken, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        console.log(error);
        return response(res,401, 'Invalid or expired token');
    }
}

export default authMiddleware;
// 
