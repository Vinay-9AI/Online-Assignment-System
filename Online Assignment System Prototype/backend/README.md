# OAS Backend

This is a minimal Express + MongoDB backend for the Online Assignment System prototype.

Setup

1. Copy `.env.example` to `.env` and fill in `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies:

   npm install

3. Run the development server:

   npm run dev

API overview

- POST /api/auth/register { name, email, password, role }  // role: "teacher" or "student"
- POST /api/auth/login { email, password }
- GET /api/users  // teacher-only, lists all users (students and teachers)

Teacher-only actions (require Authorization: Bearer <token>)
- POST /api/courses  { title, description }
- DELETE /api/courses/:id
- POST /api/courses/:id/assign-students { studentIds: [] }
- POST /api/assignments { courseId, title, description, dueDate }
- GET /api/submissions/:assignmentId
- GET /api/submissions/:id/download
- POST /api/submissions/:id/grade { grade, feedback }

Student actions
- GET /api/courses  // lists courses assigned to the logged-in student
- GET /api/assignments/:courseId
- POST /api/assignments/:id/submit (form-data, file field name: "file")
- GET /api/submissions/student  // list student's submissions and grades

Notes

- Files are stored in MongoDB as binary blobs in the `Submission` document for simplicity. For production you should use S3 or GridFS.
- Keep your `.env` secret and don't commit it.
