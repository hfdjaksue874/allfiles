
import e from "express";
import { adminLogin, adminLogout, getUser, loginUser, registerUser, updateUser, userLogout } from "../controllers/userController.js";
import authenticateUser from "../middleware/middleware.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const userRoute = e.Router();

userRoute.get('/get',getUser)
userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.post("/logout", userLogout);
userRoute.put('/update', authenticateUser, updateUser);

// Admin routes
userRoute.post('/admin/login', adminLogin);
userRoute.post('/admin/logout', requireAdmin, adminLogout);

// Add a test route to verify authentication is working
userRoute.get('/test-auth', authenticateUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: req.user
    });
});

// Add auth status route to help debug authentication issues
userRoute.get('/auth-status', (req, res) => {
    // Check for token
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
                  ? req.headers.authorization.split(' ')[1] : null);
    
    res.status(200).json({
        hasToken: !!token,
        tokenSource: token ? 
            (req.cookies.token ? 'cookie' : 'header') : 'none',
        headers: {
            authorization: req.headers.authorization || 'not set',
            cookie: req.headers.cookie || 'not set'
        }
    });
});

// Add this route to get current user info
userRoute.get('/me', authenticateUser, (req, res) => {
    try {
        // req.user is set by the authenticateUser middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: "Not authenticated"
            });
        }
        
        res.status(200).json({
            success: true,
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error("Get Current User Error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get user information"
        });
    }
});

export default userRoute;

