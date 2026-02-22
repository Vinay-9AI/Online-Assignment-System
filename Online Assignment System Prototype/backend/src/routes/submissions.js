const express = require('express');
const router = express.Router();
const multer = require('multer');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { authMiddleware, requireRole } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Student submits an assignment
router.post('/:assignmentId/submit', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can submit' });
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    // Check student is registered in course
    const course = await Course.findById(assignment.course._id);
    if (!course.students.map(s => s.toString()).includes(req.user.id)) return res.status(403).json({ message: 'You are not enrolled in this course' });
    if (!req.file) return res.status(400).json({ message: 'Missing file' });
    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user.id,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      fileData: req.file.buffer
    });
    res.json({ message: 'Submitted', submissionId: submission._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher: list submissions for an assignment
router.get('/:assignmentId', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId).populate('course');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (assignment.course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const subs = await Submission.find({ assignment: req.params.assignmentId }).populate('student', 'name email');
    res.json(subs.map(s => ({ id: s._id, student: s.student, filename: s.filename, submittedAt: s.submittedAt, grade: s.grade, feedback: s.feedback })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download a submission (teacher who owns course or the student who submitted)
router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate({ path: 'assignment', populate: { path: 'course' } }).populate('student', 'name email');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    const isTeacherOwner = req.user.role === 'teacher' && submission.assignment.course.teacher.toString() === req.user.id;
    const isStudentOwner = req.user.role === 'student' && submission.student._id.toString() === req.user.id;
    if (!isTeacherOwner && !isStudentOwner) return res.status(403).json({ message: 'Forbidden' });
    res.setHeader('Content-Disposition', `attachment; filename="${submission.filename}"`);
    res.setHeader('Content-Type', submission.contentType || 'application/octet-stream');
    res.send(submission.fileData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher grades a submission
router.post('/:id/grade', authMiddleware, requireRole('teacher'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id).populate({ path: 'assignment', populate: { path: 'course' } });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    if (submission.assignment.course.teacher.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();
    res.json({ message: 'Graded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: list their submissions + grades
router.get('/student/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students' });
    const subs = await Submission.find({ student: req.user.id }).populate('assignment', 'title course');
    res.json(subs.map(s => ({ id: s._id, assignment: s.assignment, filename: s.filename, submittedAt: s.submittedAt, grade: s.grade, feedback: s.feedback })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
