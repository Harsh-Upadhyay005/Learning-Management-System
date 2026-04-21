# Learning Management System (LMS) Backend

A production-oriented Node.js backend for a Learning Management System with role-based access, course authoring, lecture delivery, progress tracking, and payment integration.

## Project Overview

This repository contains the backend API for an LMS platform where:
- Students can sign up, sign in, manage profile, and track learning progress.
- Instructors can create courses and upload lectures.
- Users can purchase courses via Stripe or Razorpay.
- The system enforces secure defaults through middleware for rate limiting, sanitization, and auth.

## Tech Stack

- Runtime: Node.js
- Framework: Express (ES Modules)
- Database: MongoDB with Mongoose
- Auth: JWT (HTTP-only cookie)
- File Uploads: Multer
- Media Storage: Cloudinary
- Payments: Stripe and Razorpay
- Security: Helmet, CORS, HPP, express-mongo-sanitize, express-rate-limit
- Logging: Morgan

## Current Folder Structure

```text
LMS/
├── controllers/                # Request handlers (business logic)
│   ├── course.controller.js
│   ├── courseProgress.controller.js
│   ├── coursePurchase.controller.js
│   ├── health.controller.js
│   ├── razorpay.controller.js
│   └── user.controller.js
├── database/
│   └── db.js                   # MongoDB connection manager with retry logic
├── middleware/
│   ├── auth.middleware.js      # Auth + RBAC helpers
│   ├── error.middleware.js     # AppError, catchAsync, global error helpers
│   └── validation.middleware.js# express-validator based input validation
├── models/                     # Mongoose schemas
│   ├── course.model.js
│   ├── courseProgress.js
│   ├── coursePurchase.model.js
│   ├── lecture.model.js
│   └── user.model.js
├── routes/
│   ├── course.route.js
│   ├── courseProgress.route.js
│   ├── health.routes.js
│   ├── media.route.js
│   ├── purchaseCourse.route.js
│   ├── razorpay.routes.js
│   └── user.route.js
├── uploads/                    # Temporary local upload storage (multer)
├── utils/
│   ├── cloudinary.js
│   ├── generateToken.js
│   └── multer.js
├── index.js                    # App bootstrap
└── package.json
```

## Architecture Summary

### Layered Backend Design
- Route layer: Defines endpoints and composes middleware.
- Controller layer: Contains business logic for each feature domain.
- Model layer: Mongoose schemas with hooks, methods, and indexes.
- Middleware layer: Auth, validation, and centralized error behavior.
- Utility layer: Token generation, media upload/delete, multipart handling.

### Security Pipeline
- `helmet()` for secure HTTP headers
- `express-mongo-sanitize()` to block Mongo operator injection
- `hpp()` to mitigate HTTP Parameter Pollution
- Rate limit on `/api` namespace (100 req / 15 min / IP)
- CORS with configurable origin + credentials support
- JWT stored in HTTP-only cookie

## Data Models (Important)

### User
Key fields:
- `name`, `email` (unique, normalized)
- `password` (hashed via pre-save hook)
- `role` (`student`, `instructor`, `admin`)
- `avatar`, `bio`
- `enrolledCourses[]` (with enrollment date)
- `createdCourses[]`
- Password reset token/expiry

Methods/virtuals:
- `comparePassword()`
- `getResetPasswordToken()`
- `updateLastActive()`
- `totalEnrolledCourses` (virtual)

### Course
Key fields:
- `title`, `subtitle`, `description`, `category`
- `level` (`beginner`, `intermediate`, `advanced`)
- `price`, `thumbnail`
- `instructor` ref
- `lectures[]`, `enrolledStudents[]`
- `isPublished`, `totalDuration`, `totalLectures`

Virtuals/hooks:
- `averageRating` (placeholder)
- pre-save hook updates `totalLectures`

### Lecture
Key fields:
- `title`, `description`, `videoUrl`, `publicId`
- `duration`, `order`, `isPreview`

Hooks:
- pre-save duration rounding

### CourseProgress
Tracks per-user progress on a course:
- `user`, `course`
- `lectureProgress[]` (`lecture`, `isCompleted`, `watchTime`, `lastWatched`)
- `completionPercentage`, `isCompleted`, `lastAccessed`

Hook/method:
- pre-save completion calculation
- `updateLastAccessed()`

### CoursePurchase
Tracks payment lifecycle:
- `course`, `user`, `amount`, `currency`
- `status` (`pending`, `completed`, `failed`, `refunded`)
- `paymentMethod`, `paymentId`
- Refund metadata

Indexes/virtual:
- indexes for purchase lookup performance
- `isRefundable` (30-day window)

## API Modules

### Currently Mounted in index.js
- `GET /health`
- `POST /api/v1/users/signup`
- `POST /api/v1/users/signin`
- `POST /api/v1/users/signout`
- `GET /api/v1/users/profile`
- `PATCH /api/v1/users/profile`
- `PATCH /api/v1/users/change-password`
- `DELETE /api/v1/users/account`

### Implemented But Not Yet Mounted in index.js
These route files are present and implemented:
- `routes/course.route.js`
- `routes/courseProgress.route.js`
- `routes/purchaseCourse.route.js`
- `routes/razorpay.routes.js`

To activate these modules, mount them in `index.js` under `/api/v1`.

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUD_NAME=your_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add environment variables
Create `.env` from the template above.

### 3. Start development server
```bash
npm run dev
```

### 4. Production start
```bash
npm start
```

## Recommended Bootstrap Enhancements

For a stronger production-ready setup, ensure the following in `index.js`:
- Initialize DB connection from `database/db.js` during app startup.
- Mount all implemented feature routes (`courses`, `progress`, `payments`, `razorpay`).
- Use shared global error middleware from `middleware/error.middleware.js` for consistent error shape.

## Example End-to-End User Flow

1. User signs up or signs in.
2. Instructor creates a course and uploads lectures.
3. Student browses/searches published courses.
4. Student purchases a course (Stripe or Razorpay).
5. Student watches lectures and progress is tracked per lecture.

## Project Strengths

- Clear separation of concerns by domain (users, courses, progress, purchases).
- Strong schema design with validations, hooks, and model methods.
- Security middleware stack already integrated.
- Multi-provider payment architecture.
- Cloud-based media handling through Cloudinary.

## Suggested Next Improvements

- Add automated tests (unit + integration) using Jest/Supertest.
- Add API documentation (Swagger/OpenAPI or Postman collection export).
- Add refresh token strategy and secure cookie options for production (`secure`, `sameSite`).
- Add instructor/admin analytics endpoints.
- Add CI checks (lint, tests) and deployment docs.

## Author

Harsh Upadhyay
