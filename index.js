import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import ratelimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import healthRouter from './routes/health.routes.js';
import userRouter from './routes/user.route.js';
import courseRouter from './routes/course.route.js';
import courseProgressRouter from './routes/courseProgress.route.js';
import purchaseCourseRouter from './routes/purchaseCourse.route.js';
import razorpayRouter from './routes/razorpay.routes.js';
import mediaRouter from './routes/media.route.js';
import connectDB from './database/db.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Global rate limiting
const limiter = ratelimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // limit each IP to 100 requests per window
    message: "Too many request from this IP, please try later"
});

// security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use("/api", limiter);
app.use(cookieParser());



//logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//Body parser middleware
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/purchases/webhook') {
        return next();
    }

    return express.json({ limit: '100kb' })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// cors configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET","POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
        "Content-type",
        "Authorization",
        "X-Requested-with",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept",
    ],
}));

// API Routes localhost:8000/api/v1/......

app.use("/health", healthRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/course-progress", courseProgressRouter);
app.use("/api/v1/purchases", purchaseCourseRouter);
app.use("/api/v1/razorpay", razorpayRouter);
app.use("/api/v1/media", mediaRouter);





// it shuld be always at bottom 
// 404 handler 

app.use((req, res) => {
    res.status(404).json({ status: "error", message: 'Route not found' });
});

app.use(errorHandler);

const startServer = async () => {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
};

startServer();
