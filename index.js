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
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ status: "error", message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

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





// it shuld be always at bottom 
// 404 handler 

app.use((req, res) => {
    res.status(404).json({ status: "error", message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
