import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    content:{type:String, required:true},
    contentType:{type:String, enum:['text', 'image', 'video'],default:'text'},
    viewers:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    expireAt:{type:Date, default:Date.now, required:true},
},{timestamps:true});

const statusModel = mongoose.model('Status', statusSchema);

export default statusModel;

