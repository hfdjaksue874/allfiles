import { v2 as cloudinary } from 'cloudinary';
import { configDotenv } from 'dotenv';

configDotenv();

const connectCloudinary = async () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });
        
        console.log('Cloudinary configured successfully');
        console.log('Cloud name:', process.env.CLOUDINARY_NAME);
        console.log('API key exists:', !!process.env.CLOUDINARY_API_KEY);
        console.log('API secret exists:', !!process.env.CLOUDINARY_SECRET_KEY);
    } catch (error) {
        console.error('Cloudinary configuration error:', error);
    }
};

export default connectCloudinary