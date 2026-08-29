# 📚 Online Assignment System — Backend

### Secure Assignment Management API Built with Express & MongoDB

The **Online Assignment System Backend** is a RESTful backend service for managing courses, assignments, student submissions, grading, and user authentication.

It provides separate capabilities for **teachers and students**, with JWT-based authentication and role-based access control.

> **A backend foundation for managing the complete digital assignment workflow — from course creation to submission and grading.**

---

## ✨ Features

### 🔐 Authentication & Authorization

* User registration
* User login
* JWT-based authentication
* Role-based access control
* Teacher and student permissions

Supported roles:

```text
Teacher
Student
```

---

### 👨‍🏫 Teacher Features

Teachers can:

* 👥 View registered users
* 📚 Create courses
* 🗑️ Delete courses
* 👨‍🎓 Assign students to courses
* 📝 Create assignments
* 📥 View student submissions
* 📄 Download submitted files
* ✅ Grade assignments
* 💬 Provide feedback

---

### 👨‍🎓 Student Features

Students can:

* 📚 View assigned courses
* 📝 View course assignments
* 📤 Submit assignments
* 📄 Upload assignment files
* 📊 View submission status
* 🎯 View grades and feedback

---

# 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │      Client     │
                    │  Web / Mobile   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Express.js API │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
      ┌────────────┐  ┌─────────────┐  ┌─────────────┐
      │    Auth    │  │   Courses   │  │ Assignments │
      │    APIs    │  │    APIs     │  │    APIs     │
      └────────────┘  └─────────────┘  └─────────────┘
             │               │               │
             └───────────────┼───────────────┘
                             ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │                 │
                    │ Users           │
                    │ Courses         │
                    │ Assignments     │
                    │ Submissions     │
                    └─────────────────┘
```

---

# 🛠️ Technology Stack

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Backend runtime     |
| Express.js | REST API framework  |
| MongoDB    | Database            |
| JWT        | Authentication      |
| JavaScript | Backend development |
| npm        | Package management  |

---

# 📁 Project Structure

```text
backend/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/
├── config/
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

# ⚙️ Setup

## 1. Clone the repository

```bash
git clone <repository-url>
```

Navigate to the backend directory:

```bash
cd Online-Assignment-System/backend
```

---

## 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows:

```cmd
copy .env.example .env
```

Configure:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

⚠️ **Never commit `.env` to GitHub.**

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Start the Development Server

```bash
npm run dev
```

The backend will start using the development configuration defined in the project.

---

# 🔌 API Documentation

## 🔐 Authentication

### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "John",
  "email": "john@example.com",
  "password": "password",
  "role": "student"
}
```

Supported roles:

```text
teacher
student
```

---

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "password"
}
```

The API returns an authentication token that can be used for protected endpoints.

---

# 👨‍🏫 Teacher APIs

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Get Users

```http
GET /api/users
```

Teacher-only endpoint for retrieving registered users.

---

### Create Course

```http
POST /api/courses
```

Request:

```json
{
  "title": "Data Structures",
  "description": "Learn fundamental data structures."
}
```

---

### Delete Course

```http
DELETE /api/courses/:id
```

---

### Assign Students

```http
POST /api/courses/:id/assign-students
```

Request:

```json
{
  "studentIds": [
    "student_id_1",
    "student_id_2"
  ]
}
```

---

### Create Assignment

```http
POST /api/assignments
```

Request:

```json
{
  "courseId": "course_id",
  "title": "Binary Trees",
  "description": "Implement binary tree operations.",
  "dueDate": "2026-09-30"
}
```

---

### View Submissions

```http
GET /api/submissions/:assignmentId
```

---

### Download Submission

```http
GET /api/submissions/:id/download
```

---

### Grade Submission

```http
POST /api/submissions/:id/grade
```

Request:

```json
{
  "grade": 85,
  "feedback": "Good implementation. Improve code organization."
}
```

---

# 👨‍🎓 Student APIs

### View Assigned Courses

```http
GET /api/courses
```

Returns courses assigned to the authenticated student.

---

### View Course Assignments

```http
GET /api/assignments/:courseId
```

---

### Submit Assignment

```http
POST /api/assignments/:id/submit
```

Uses `multipart/form-data`.

File field:

```text
file
```

---

### View My Submissions

```http
GET /api/submissions/student
```

Returns the student's submissions, grades, and feedback.

---

# 🔄 Assignment Workflow

```text
Teacher Registers
       ↓
Creates Course
       ↓
Assigns Students
       ↓
Creates Assignment
       ↓
Student Views Assignment
       ↓
Student Uploads Submission
       ↓
Teacher Reviews Submission
       ↓
Teacher Grades Assignment
       ↓
Student Receives Grade & Feedback
```

---

# 🔐 Security

The backend uses:

* JWT authentication
* Role-based authorization
* Environment variables for secrets
* Protected teacher endpoints
* Protected student endpoints

Sensitive values such as:

```text
MONGODB_URI
JWT_SECRET
```

must be stored in `.env`.

---

# 📦 File Storage

For the prototype, submitted files are stored as **binary data inside MongoDB** within the `Submission` document.

This approach simplifies the prototype architecture.

For a production deployment, object storage such as **Amazon S3** or MongoDB **GridFS** would be more appropriate for large files and scalable storage.

---

# 🚀 Future Improvements

Potential enhancements include:

* 📧 Email notifications
* ⏰ Assignment deadline reminders
* 📊 Teacher analytics dashboard
* 📈 Student performance analytics
* 🔔 Real-time notifications
* ☁️ Cloud file storage
* 🔎 Advanced assignment search
* 📱 Mobile application support
* 🧪 Automated API testing
* 🐳 Docker deployment
* ☁️ Cloud deployment
* 📚 Assignment plagiarism detection

---

# 🎯 Project Goals

This project demonstrates practical implementation of:

* REST API development
* Backend architecture
* MongoDB database integration
* Authentication
* Authorization
* Role-based access control
* File upload handling
* CRUD operations
* API design

---

# 👨‍💻 Author

### Vinay

Computer Science & Engineering Student

Interested in:

* 💻 Full-Stack Development
* 🤖 Artificial Intelligence
* 📊 Data Analytics
* 🚀 Software Engineering

GitHub:

https://github.com/Vinay-9AI

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is developed for educational and development purposes.
