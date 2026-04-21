# Learning Management System (LMS) Backend

A robust Node.js + Express backend for a Learning Management System with role-based access, media uploads, progress tracking, and online payments.

## Why this project

This backend is built to support real LMS workflows:
- Authentication and profile management for students and instructors
- Course creation and lecture management
- Course progress tracking at lecture level
- Stripe and Razorpay payment integration
- Security-first middleware configuration

## Tech stack

- Node.js
- Express (ES Modules)
- MongoDB + Mongoose
- JWT (HTTP-only cookie auth)
- Multer + Cloudinary
- Stripe + Razorpay
- Helmet, CORS, HPP, Rate Limiting, Mongo Sanitize

## Project structure

```text
LMS/
├── controllers/
├── database/
├── middleware/
├── models/
├── routes/
├── uploads/
├── utils/
├── index.js
├── package.json
└── README.md
```

## Folder purpose

- controllers: business logic for user, course, progress, and payment modules
- database: MongoDB connection manager with retry strategy
- middleware: auth, error handling, and request validation
- models: Mongoose schemas, hooks, methods, and indexes
- routes: feature route definitions grouped by domain
- utils: Cloudinary integration, token generation, and upload config

## Security highlights

- Helmet for secure response headers
- express-mongo-sanitize for query injection hardening
- hpp for HTTP parameter pollution protection
- Global API rate limit under /api
- CORS allowlist support via env variable
- JWT stored in HTTP-only cookie

## Data model overview

### User
- name, email, password, role
- avatar, bio, enrolledCourses, createdCourses
- reset token support and lastActive tracking

### Course
- title, subtitle, description, category, level, price
- thumbnail, instructor, lectures, enrolledStudents, isPublished

### Lecture
- title, description, videoUrl, publicId, duration, order, isPreview

### CourseProgress
- per-user per-course lecture progress and completion percentage

### CoursePurchase
- payment lifecycle status, method, amount, refund metadata

## API status

### Mounted now
- GET /health
- POST /api/v1/users/signup
- POST /api/v1/users/signin
- POST /api/v1/users/signout
- GET /api/v1/users/profile
- PATCH /api/v1/users/profile
- PATCH /api/v1/users/change-password
- DELETE /api/v1/users/account

### Implemented but not mounted in index.js yet
- routes/course.route.js
- routes/courseProgress.route.js
- routes/purchaseCourse.route.js
- routes/razorpay.routes.js

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create env file

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Run in development

```bash
npm run dev
```

4. Run in production mode

```bash
npm start
```

## Environment variables

Use .env.example as reference.

Required groups:
- App: PORT, NODE_ENV, CORS_ORIGIN, CLIENT_URL
- Database: MONGO_URI
- Auth: JWT_SECRET
- Cloudinary: CLOUD_NAME, API_KEY, API_SECRET
- Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Razorpay: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

## GitHub upload checklist

- Keep secrets only in .env (never commit real keys)
- Keep generated uploads out of git
- Ensure README is up to date with actual route mount status
- Push from a clean branch with descriptive commit message

## Recommended next steps

- Mount remaining implemented route modules in index.js
- Add API docs (Swagger/OpenAPI or Postman export)
- Add tests (Jest + Supertest)
- Add CI for lint and tests

## Author

Harsh Upadhyay
