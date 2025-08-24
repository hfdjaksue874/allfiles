import bodyParser from "body-parser";
import e from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db.js";
import userRoute from "./src/routes/userRoute.js";
import productRoute from "./src/routes/productRotue.js";
import connectCloudinary from "./src/config/cloudinary.js"; // Import cloudinary config
import cors from "cors"; // Add CORS if needed
import pinRoute from "../backend/src/routes/pinRoute.js";
import cartRoute from "./src/routes/cartRoute.js";
import wishlistRoute from "./src/routes/wishlistRoute.js";
import orderAddressRoute from "./src/routes/orderAddressRoute.js";
import orderRoute from './src/routes/orderRoute.js';

const app = e();

// Middleware
app.use(e.json());
app.use(e.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration (if needed for frontend)
// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,          // from .env if deployed
  "http://localhost:5173",           // Vite default
  "http://localhost:5174",           // If you run multiple instances
  "http://127.0.0.1:5173",
  "https://allfiles-f26m.vercel.app"           // Sometimes browser uses 127.0.0.1
].filter(Boolean); // remove undefined

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Add this before your routes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
    res.json({ message: "API is working!" });
});

// Initialize database and cloudinary
connectDB();
connectCloudinary(); // Initialize Cloudinary

// Routes
app.use('/users', userRoute);
app.use('/products', productRoute);
app.use('/cart', cartRoute);
app.use('/pin',pinRoute)
app.use('/wishlist', wishlistRoute);
app.use('/address',orderAddressRoute)
app.use('/orders', orderRoute);

export default app;