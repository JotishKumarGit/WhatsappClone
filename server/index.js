import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/db.js';
import authRoute from './routes/authRoute.js';
import chatRoute from './routes/chatRoute.js';
const app = express();

const PORT = process.env.PORT || 5000;

// middleware 
app.use(express.json()); // parse body data
app.use(cookieParser()); // parse token on every request 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // whose request is call
app.use(cors());


// api 
app.get('/', (req, res) => {
    res.send("This is root");
})

// routes
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);


connectDb();
app.listen(PORT, () => {
    console.log(`Server is listen port ${PORT}`);
})

