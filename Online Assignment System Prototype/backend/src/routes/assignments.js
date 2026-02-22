const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Create assignment (teacher only)
router.post('/', authMiddleware, requireRole('teacher'), async (req, res) => {
  const { courseId, title, description, dueDate } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const a = await Assignment.create({ course: courseId, title, description, dueDate });
    res.json(a);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List assignments for a course
router.get('/:courseId', authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
