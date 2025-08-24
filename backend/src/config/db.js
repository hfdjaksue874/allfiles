import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

// Connect to MongoDB
const dbUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/mydatabase";

export const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("MongoDB connected...");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};
// Call the function to connect to MongoDB



