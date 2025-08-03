import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        if (!con) {
            console.log("Mongodb connection error");
        } else {
            console.log("MongoDb connected successfully");
        }
    } catch (error) {
        console.log("Mongodb connection error", error);
    }
}

export default connectDb;


