import express from 'express';
import Course from '../models/Courses.js';
const router = express.Router();


router.get('/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////
// SECTIONS
//////////////////////////////

// Add a section to a course
router.post('/:courseId/section', async (req, res) => {
  const { name } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.sections.push({ name, subjects: [] });
    await course.save();
    res.status(201).json(course.sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rename a section
router.put('/:courseId/section/:sectionIndex', async (req, res) => {
  const { name } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const index = parseInt(req.params.sectionIndex);
    if (isNaN(index) || index < 0 || index >= course.sections.length)
      return res.status(400).json({ message: 'Invalid section index' });

    course.sections[index].name = name;
    await course.save();
    res.json(course.sections[index]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a section
router.delete('/:courseId/section/:sectionIndex', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const index = parseInt(req.params.sectionIndex);
    if (isNaN(index) || index < 0 || index >= course.sections.length)
      return res.status(400).json({ message: 'Invalid section index' });

    course.sections.splice(index, 1);
    await course.save();
    res.json(course.sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////
// CLASSES (Subjects)
//////////////////////////////

// Add a class to a section
router.post('/:courseId/section/:sectionIndex/subject', async (req, res) => {
  const { name, modules, hours, description, date, time } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    if (isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length)
      return res.status(400).json({ message: 'Invalid section index' });

    course.sections[sectionIndex].subjects.push({
      name, modules, hours, description, date, time, assignments: []
    });
    await course.save();
    res.status(201).json(course.sections[sectionIndex].subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a class
router.put('/:courseId/section/:sectionIndex/subject/:subjectIndex', async (req, res) => {
  const { name, modules, hours, description, date, time } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    const subjectIndex = parseInt(req.params.subjectIndex);

    if (
      isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length ||
      isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= course.sections[sectionIndex].subjects.length
    )
      return res.status(400).json({ message: 'Invalid index' });

    const subject = course.sections[sectionIndex].subjects[subjectIndex];
    subject.name = name;
    subject.modules = modules;
    subject.hours = hours;
    subject.description = description;
    subject.date = date;
    subject.time = time;

    await course.save();
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a class
router.delete('/:courseId/section/:sectionIndex/subject/:subjectIndex', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    const subjectIndex = parseInt(req.params.subjectIndex);

    if (
      isNaN(sectionIndex) || sectionIndex < 0 || sectionIndex >= course.sections.length ||
      isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= course.sections[sectionIndex].subjects.length
    )
      return res.status(400).json({ message: 'Invalid index' });

    course.sections[sectionIndex].subjects.splice(subjectIndex, 1);
    await course.save();
    res.json(course.sections[sectionIndex].subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//////////////////////////////
// ASSIGNMENTS
//////////////////////////////

// Add an assignment to a class
router.post('/:courseId/section/:sectionIndex/subject/:subjectIndex/assignment', async (req, res) => {
  const { title, description, dueDate } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    const subjectIndex = parseInt(req.params.subjectIndex);

    const classObj = course.sections[sectionIndex].subjects[subjectIndex];
    if (!classObj) return res.status(400).json({ message: 'Invalid index' });

    classObj.assignments.push({ title, description, dueDate, submissions: [] });
    await course.save();
    res.status(201).json(classObj.assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grade a student's submission for an assignment
router.post('/:courseId/section/:sectionIndex/subject/:subjectIndex/assignment/:assignmentIndex/grade', async (req, res) => {
  const { studentId, grade, score, fileUrl } = req.body;

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    const subjectIndex = parseInt(req.params.subjectIndex);
    const assignmentIndex = parseInt(req.params.assignmentIndex);

    const classObj = course.sections[sectionIndex].subjects[subjectIndex];
    if (!classObj || assignmentIndex < 0 || assignmentIndex >= classObj.assignments.length)
      return res.status(400).json({ message: 'Invalid index' });

    const assignment = classObj.assignments[assignmentIndex];

    const existing = assignment.submissions.find(s => s.studentId === studentId);
    if (existing) {
      existing.grade = grade;
      existing.score = score;
      if (fileUrl) existing.fileUrl = fileUrl;
    } else {
      assignment.submissions.push({ studentId, grade, score, fileUrl });
    }

    await course.save();
    res.json(assignment.submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all assignments for a class
router.get('/:courseId/section/:sectionIndex/subject/:subjectIndex/assignments', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionIndex = parseInt(req.params.sectionIndex);
    const subjectIndex = parseInt(req.params.subjectIndex);

    const classObj = course.sections[sectionIndex].subjects[subjectIndex];
    if (!classObj) return res.status(400).json({ message: 'Invalid index' });

    res.json(classObj.assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
