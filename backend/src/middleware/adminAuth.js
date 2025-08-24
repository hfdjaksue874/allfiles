import jwt from 'jsonwebtoken';

export const verifyAdminToken = (req, res, next) => {
    try {
        // Get token from header or cookies
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies.adminToken ||
                     req.body.adminToken;

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No admin token provided.' });
        }

        // Verify the token using admin JWT secret
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        
        // Add admin info to request object
        req.admin = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Admin token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid admin token' });
        }
        return res.status(500).json({ error: 'Token verification failed' });
    }
};

// Optional: Additional admin role verification
export const verifyAdminRole = (req, res, next) => {
    try {
        // Check if the decoded token has admin privileges
        if (!req.admin || !req.admin.username) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        
        // You can add more role-based checks here if needed
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Admin role verification failed' });
    }
};

// Combined middleware for admin authentication and authorization
export const requireAdmin = (req, res, next) => {
    try {
        // Get token from multiple sources
        const token = req.cookies.adminToken || 
                     req.headers.authorization?.split(' ')[1] ||
                     req.header('Authorization')?.replace('Bearer ', '');
        
        console.log('Admin token received:', !!token); // Debug log
        console.log('Admin JWT Secret exists:', !!process.env.ADMIN_JWT_SECRET); // Debug log

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Admin token required."
            });
        }

        // Verify token with the same secret used to create it
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        
        console.log('Token decoded successfully:', decoded); // Debug log

        // Check if the decoded token contains admin credentials
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Admin auth error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid admin token signature."
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Admin token has expired."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token verification failed.",
            error: error.message
        });
    }
};