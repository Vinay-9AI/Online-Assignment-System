const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Create course (teacher only)
router.post('/', authMiddleware, requireRole('teacher'), async (req, res) => {
  const { title, description } = req.body;
  try {
    const course = await Course.create({ title, description, teacher: req.user.id });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course (teacher only, only if teacher owns it)
router.delete('/:id', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await course.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign students to course (teacher only)
router.post('/:id/assign-students', authMiddleware, requireRole('teacher'), async (req, res) => {
  const { studentIds } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    // Validate students
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    course.students = Array.from(new Set([...(course.students || []), ...students.map(s => s._id.toString())]));
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List courses for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const courses = await Course.find({ teacher: req.user.id }).populate('students', 'name email');
      return res.json(courses);
    } else {
      // student: list courses where student is in students
      const courses = await Course.find({ students: req.user.id }).populate('teacher', 'name email');
      return res.json(courses);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List all users (teacher only) - to let teacher view students
router.get('/all-users', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
