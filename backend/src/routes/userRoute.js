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

export default userRoute;

