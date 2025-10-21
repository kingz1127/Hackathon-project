import express from 'express';
import Course from '../models/Courses.js';
const router = express.Router();

// GET all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single course by id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET courses by teacher
router.get("/teacher/:teacherId", async (req, res) => {
  const { teacherId } = req.params;
  try {
    const courses = await Course.find({ instructor: teacherId });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// CREATE a new course
router.post('/', async (req, res) => {
  const { id, title, description, instructor, classes, grades, category, status, technologies } = req.body;

  const course = new Course({
    id,
    title,
    description,
    instructor,
    classes,
    grades,
    category,
    status,
    technologies
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a course
router.put('/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a course
router.delete('/:id', async (req, res) => {
  try {
    const deletedCourse = await Course.findOneAndDelete({ id: req.params.id });
    if (!deletedCourse) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
