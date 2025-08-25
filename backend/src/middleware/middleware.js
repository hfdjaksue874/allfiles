import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authenticateUser = async (req, res, next) => {
    try {
        // Enhanced token extraction with better logging
        let token;
        
        // Check Authorization header first (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token found in Authorization header");
        } 
        // Then check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log("Token found in cookies");
        }
        
        if (!token) {
            console.log("No token found in request");
            return res.status(401).json({ 
                success: false, 
                error: "Authentication required. Please login." 
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token verified successfully for user ID:", decoded.id);
            
            // Find user by id
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                console.log("User not found for ID:", decoded.id);
                return res.status(401).json({ 
                    success: false, 
                    error: "User not found or token invalid" 
                });
            }
            
            // Add user to request object
            req.user = user;
            next();
        } catch (jwtError) {
            console.error("JWT Verification Error:", jwtError);
            
            // Handle specific JWT errors
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    error: "Token expired. Please login again." 
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false, 
                    error: "Invalid token. Please login again." 
                });
            }
            
            throw jwtError; // Re-throw for general error handling
        }
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ 
            success: false, 
            error: "Authentication failed: " + error.message 
        });
    }
};

export default authenticateUser;