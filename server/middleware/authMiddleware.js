import jwt from 'jsonwebtoken';
import response from '../utills/responseHandler';

const authMiddleware = (req, res, next) => {
    try {
        const authToken = req.cookies?.auth_token;
        if (!authToken) {
           return response(res, 401, 'Authorization token missing');
        }

        const decode = jwt.verify(authToken, process.env.JWT_SECRET);
        req.user =decode;
        

    } catch (error) {
        console.log(error);

    }
}

// 2 hours 23 minutes
