import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from "../models/userModel.js"; // Import the User model
import { configDotenv } from "dotenv";
configDotenv();

const registerUser = async (req, res) =>{
    const {name, email, password} = req.body;

    try {
        
        // Check if user with the same email already exists
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({error: 'User with the same email already exists'});
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const userToken = jwt.sign({_id: new mongoose.Types.ObjectId()}, process.env.JWT_SECRET, {expiresIn: '1h'});
        const user = new User({name, email, password: hashedPassword, token: userToken});
        await user.save();
        res.cookie('userToken', userToken, {httpOnly: true, maxAge: 3600000});
        res.status(201).json({message: 'User registered successfully', userToken: userToken});
        } catch (error) {
            console.error(error);
            res.status(500).json({error: 'Failed to register user'});
        }
 }

 const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Please provide email and password"
            });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }
        
        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Invalid email or password"
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Set secure cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Important for cross-site requests
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        };
        
        // Set cookie
        res.cookie('token', token, cookieOptions);
        
        // Return user info and token
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token // Also send token in response body for clients that prefer using Authorization header
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            error: "Login failed: " + error.message
        });
    }
 };

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Admin login attempt:', { email }); // Debug log
        console.log('Expected admin email:', process.env.ADMIN_EMAIL); // Debug log
        console.log('Admin JWT Secret exists:', !!process.env.ADMIN_JWT_SECRET); // Debug log

        // Check if credentials match environment variables
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            // Create admin token with the correct secret
            const token = jwt.sign(
                { 
                    email: email,
                    role: 'admin',
                    isAdmin: true,
                    username: email // Add username for compatibility
                },
                process.env.ADMIN_JWT_SECRET, // Make sure this matches what's in .env
                { expiresIn: '24h' }
            );

            console.log('Admin token created successfully'); // Debug log

            // Set cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.status(200).json({
                success: true,
                message: "Admin login successful",
                token: token,
                admin: {
                    email: email,
                    role: 'admin'
                }
            });
        } else {
            console.log('Invalid admin credentials provided'); // Debug log
            res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Admin login failed",
            error: error.message
        });
    }
};

// Admin logout
const adminLogout = (req, res) => {
    res.clearCookie('adminToken', {path: '/'});
    res.json({message: 'Admin logged out successfully'});
};

const updateUser = async (req, res) => {
    const {id, name, email, password} = req.body;
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        if (email && user.email!== email) {
            const existingUser = await User.findOne({email});
            if (existingUser) {
                return res.status(400).json({error: 'User with the same email already exists'});
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);

            user.password = hashedPassword;
            }
            await user.save();
            res.json({message: 'User updated successfully'});
        }
        catch (error) {
            console.error(error);
            res.status(500).json({error: 'Failed to update user'});
        }
        }

const deleteUser = async (req, res) => {
    const {id} = req.body;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        // Using findByIdAndDelete instead of remove() which is deprecated
        await User.findByIdAndDelete(id);
        res.json({message: 'User deleted successfully'});
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to delete user'});
    }
}

const userLogout = (req, res) => {
    res.clearCookie('userToken', {path: '/'});
    res.json({message: 'User logged out successfully'});
}

const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'User ID is required'
            });
        }

        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user'
        });
    }
}

export {userLogout, registerUser, loginUser, adminLogin, adminLogout, updateUser, deleteUser, getUser};