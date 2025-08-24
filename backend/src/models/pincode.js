import mongoose from "mongoose";

const pincodeSchema = new mongoose.Schema({
    pincode:{
        type: Number,
        required: true,
        unique: true,
        maxlength:6
    },
    
},{timestamps: true});


const Pincode = mongoose.model("Pincode", pincodeSchema);

export default Pincode;