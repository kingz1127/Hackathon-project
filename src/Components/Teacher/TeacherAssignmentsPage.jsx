import { useEffect, useState } from 'react';
import './TeacherAssignments.css';

const API_BASE_URL = 'http://localhost:5000/api';

const TeacherAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(null);
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [gradebook, setGradebook] = useState(null);

  const [newAssignment, setNewAssignment] = useState({
    classId: '',
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    totalPoints: 100,
    status: 'active'
  });

  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: ''
  });

  const [manualGrade, setManualGrade] = useState({
    studentId: '',
    classId: '',
    gradeType: 'quiz',
    title: '',
    score: 0,
    maxScore: 100,
    comments: ''
  });

  // Fetch classes once
  useEffect(() => {
    fetch(`${API_BASE_URL}/classes/teacher`)
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch assignments when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterClass !== 'all') params.append('classId', filterClass);
    if (filterStatus !== 'all') params.append('status', filterStatus);

    setLoading(true);
    fetch(`${API_BASE_URL}/assignments/teacher?${params.toString()}`)
      .then(res => res.json())
      .then(data => setAssignments(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filterClass, filterStatus]);

  const fetchSubmissions = (assignmentId) => {
    fetch(`${API_BASE_URL}/submissions/teacher/assignment/${assignmentId}`)
      .then(res => res.json())
      .then(data => setSubmissions(prev => ({ ...prev, [assignmentId]: data })))
      .catch(err => console.error(err));
  };

  const fetchGradebook = (classId) => {
    fetch(`${API_BASE_URL}/grades/teacher/class/${classId}`)
      .then(res => res.json())
      .then(data => setGradebook(data))
      .catch(err => console.error(err));
  };

  const handleCreateAssignment = () => {
    fetch(`${API_BASE_URL}/assignments/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    })
      .then(() => {
        setShowCreateModal(false);
        setNewAssignment({
          classId: '', title: '', description: '', instructions: '',
          dueDate: '', totalPoints: 100, status: 'active'
        });
        alert('Assignment created successfully!');
      })
      .catch(err => alert('Failed to create assignment: ' + err.message));
  };

  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm('Delete this assignment?')) {
      fetch(`${API_BASE_URL}/assignments/teacher/${assignmentId}`, { method: 'DELETE' })
        .then(() => {
          alert('Assignment deleted successfully!');
        })
        .catch(err => alert('Failed to delete assignment: ' + err.message));
    }
  };

  const handleGradeSubmission = (submissionId) => {
    fetch(`${API_BASE_URL}/submissions/teacher/${submissionId}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gradeData)
    })
      .then(() => {
        setShowGradeModal(null);
        setGradeData({ grade: 0, feedback: '' });
        if (expandedAssignment) fetchSubmissions(expandedAssignment);
        alert('Submission graded successfully!');
      })
      .catch(err => alert('Failed to grade submission: ' + err.message));
  };

  const handleAddManualGrade = () => {
    fetch(`${API_BASE_URL}/grades/teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manualGrade)
    })
      .then(() => {
        setShowAddGradeModal(false);
        setManualGrade({
          studentId: '', classId: '', gradeType: 'quiz', title: '',
          score: 0, maxScore: 100, comments: ''
        });
        if (selectedClass) fetchGradebook(selectedClass);
        alert('Grade added successfully!');
      })
      .catch(err => alert('Failed to add grade: ' + err.message));
  };

  const handleExpandAssignment = (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
      fetchSubmissions(assignmentId);
    }
  };

  const getSubmissionStats = (assignmentId) => {
    const subs = submissions[assignmentId] || [];
    const graded = subs.filter(s => s.status === 'graded').length;
    const pending = subs.filter(s => s.status === 'submitted' || s.status === 'late').length;
    return { total: subs.length, graded, pending };
  };

  if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto'}}>
      {/* Header, Tabs, Filters, Assignments, Modals */}
      {/* Keep your current JSX here, just remove any token/auth usage */}
    </div>
  );
};

export default TeacherAssignmentsPage;

