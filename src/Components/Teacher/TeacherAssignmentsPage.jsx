import { Award, CheckCircle, Clock, Download, FileText, Plus, Trash2, X } from 'lucide-react';
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

  const getToken = () => localStorage.getItem('token');

  const apiCall = async (url, options = {}) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  };

  useEffect(() => {
    fetchData();
  }, [filterClass, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const classesData = await apiCall('/classes/teacher');
      setClasses(classesData);

      const params = new URLSearchParams();
      if (filterClass !== 'all') params.append('classId', filterClass);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const assignmentsData = await apiCall(`/assignments/teacher?${params.toString()}`);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const data = await apiCall(`/submissions/teacher/assignment/${assignmentId}`);
      setSubmissions(prev => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchGradebook = async (classId) => {
    try {
      const data = await apiCall(`/grades/teacher/class/${classId}`);
      setGradebook(data);
    } catch (err) {
      console.error('Error fetching gradebook:', err);
      alert('Failed to load gradebook: ' + err.message);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await apiCall('/assignments/teacher', {
        method: 'POST',
        body: JSON.stringify(newAssignment),
      });
      setShowCreateModal(false);
      setNewAssignment({
        classId: '',
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        totalPoints: 100,
        status: 'active'
      });
      fetchData();
      alert('Assignment created successfully!');
    } catch (err) {
      alert('Failed to create assignment: ' + err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Delete this assignment?')) {
      try {
        await apiCall(`/assignments/teacher/${assignmentId}`, { method: 'DELETE' });
        fetchData();
        alert('Assignment deleted successfully!');
      } catch (err) {
        alert('Failed to delete assignment: ' + err.message);
      }
    }
  };

  const handleGradeSubmission = async (submissionId) => {
    try {
      await apiCall(`/submissions/teacher/${submissionId}/grade`, {
        method: 'PUT',
        body: JSON.stringify(gradeData),
      });
      setShowGradeModal(null);
      setGradeData({ grade: 0, feedback: '' });
      if (expandedAssignment) {
        await fetchSubmissions(expandedAssignment);
      }
      alert('Submission graded successfully!');
    } catch (err) {
      alert('Failed to grade submission: ' + err.message);
    }
  };

  const handleAddManualGrade = async () => {
    try {
      await apiCall('/grades/teacher', {
        method: 'POST',
        body: JSON.stringify(manualGrade),
      });
      setShowAddGradeModal(false);
      setManualGrade({
        studentId: '',
        classId: '',
        gradeType: 'quiz',
        title: '',
        score: 0,
        maxScore: 100,
        comments: ''
      });
      if (selectedClass) {
        await fetchGradebook(selectedClass);
      }
      alert('Grade added successfully!');
    } catch (err) {
      alert('Failed to add grade: ' + err.message);
    }
  };

  const handleExpandAssignment = async (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
      await fetchSubmissions(assignmentId);
    }
  };

  const getSubmissionStats = (assignmentId) => {
    const subs = submissions[assignmentId] || [];
    const graded = subs.filter(s => s.status === 'graded').length;
    const pending = subs.filter(s => s.status === 'submitted' || s.status === 'late').length;
    return { total: subs.length, graded, pending };
  };

  if (loading) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Loading...</div>;
  }

  return (
    <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header-left { display: flex; align-items: center; gap: 16px; }
        .header-icon { color: #2563eb; }
        h1 { font-size: 28px; font-weight: 700; color: #111827; }
        .page-header p { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .btn-primary { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-secondary:hover { background: #f3f4f6; }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-icon { background: none; border: none; padding: 8px; cursor: pointer; border-radius: 6px; color: #6b7280; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: #f3f4f6; color: #111827; }
        .btn-danger { color: #dc2626; }
        .btn-danger:hover { background: #fef2f2; }
        .filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        .filters select { padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; }
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
        .tab { padding: 12px 24px; background: none; border: none; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; position: relative; transition: color 0.2s; }
        .tab.active { color: #2563eb; }
        .tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #2563eb; }
        .assignments-grid { display: grid; gap: 16px; }
        .assignment-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
        .assignment-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .assignment-card.expanded { border-color: #2563eb; }
        .assignment-header { padding: 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: start; }
        .assignment-info h3 { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px; }
        .assignment-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px; }
        .assignment-meta span { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .status-active { background: #d1fae5; color: #065f46; }
        .status-draft { background: #e5e7eb; color: #374151; }
        .assignment-actions { display: flex; gap: 8px; }
        .assignment-details { border-top: 1px solid #e5e7eb; padding: 20px; background: #f9fafb; }
        .submissions-table { background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
        .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; padding: 12px 16px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 600; color: #6b7280; }
        .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; padding: 16px; border-bottom: 1px solid #f3f4f6; align-items: center; transition: background 0.2s; }
        .table-row:hover { background: #f9fafb; }
        .student-info p { font-size: 14px; color: #111827; font-weight: 500; margin-bottom: 2px; }
        .student-info small { font-size: 12px; color: #6b7280; }
        .grade-input { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 70px; text-align: center; }
        .gradebook-section { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; margin-top: 24px; }
        .gradebook-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .gradebook-table { overflow-x: auto; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { font-size: 20px; font-weight: 600; color: #111827; }
        .form-group { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 500; color: #374151; }
        .form-group input, .form-group textarea, .form-group select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 100%; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #2563eb; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 0 20px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
        .empty-state { text-align: center; padding: 40px; color: #9ca3af; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <FileText size={32} className="header-icon" />
          <div>
            <h1>Assignments & Grading</h1>
            <p>Manage assignments, grade submissions, and track student progress</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={20} />
          Create Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className="tab active">Assignments</button>
        <button className="tab" onClick={() => {
          if (classes.length > 0) {
            setSelectedClass(classes[0]._id);
            fetchGradebook(classes[0]._id);
          }
        }}>Gradebook</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
          <option value="all">All Classes</option>
          {classes.map(cls => (
            <option key={cls._id} value={cls._id}>{cls.className}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Assignments Grid */}
      {!gradebook && (
        <div className="assignments-grid">
          {assignments.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No assignments found</h3>
              <p>Create your first assignment to get started</p>
            </div>
          ) : (
            assignments.map(assignment => {
              const stats = getSubmissionStats(assignment._id);
              return (
                <div key={assignment._id} className={`assignment-card ${expandedAssignment === assignment._id ? 'expanded' : ''}`}>
                  <div className="assignment-header" onClick={() => handleExpandAssignment(assignment._id)}>
                    <div className="assignment-info">
                      <h3>{assignment.title}</h3>
                      <p style={{color: '#6b7280', fontSize: '14px'}}>{assignment.classId?.className || 'Unknown Class'}</p>
                      <div className="assignment-meta">
                        <span><Clock size={14} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span><Award size={14} /> {assignment.totalPoints} pts</span>
                        <span><CheckCircle size={14} /> {stats.graded}/{stats.total} graded</span>
                        <span className={`status-badge status-${assignment.status}`}>{assignment.status}</span>
                      </div>
                    </div>
                    <div className="assignment-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn-icon btn-danger" onClick={() => handleDeleteAssignment(assignment._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {expandedAssignment === assignment._id && (
                    <div className="assignment-details">
                      <div style={{marginBottom: '20px'}}>
                        <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>Description</h4>
                        <p style={{color: '#6b7280', fontSize: '14px', lineHeight: '1.6'}}>{assignment.description || 'No description'}</p>
                      </div>

                      <h4 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>Submissions ({stats.total})</h4>
                      <div className="submissions-table">
                        <div className="table-header">
                          <div>Student</div>
                          <div>Submitted</div>
                          <div>Status</div>
                          <div>Grade</div>
                          <div>Actions</div>
                        </div>
                        {submissions[assignment._id] && submissions[assignment._id].length > 0 ? (
                          submissions[assignment._id].map(sub => (
                            <div key={sub._id} className="table-row">
                              <div className="student-info">
                                <p>{sub.studentId?.name || 'Unknown'}</p>
                                <small>{sub.studentId?.email}</small>
                              </div>
                              <div style={{fontSize: '13px', color: '#6b7280'}}>
                                {new Date(sub.submittedAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className={`status-badge ${sub.status === 'graded' ? 'status-active' : 'status-draft'}`}>
                                  {sub.status}
                                </span>
                              </div>
                              <div style={{fontSize: '14px', fontWeight: '600', color: sub.grade ? '#111827' : '#9ca3af'}}>
                                {sub.grade !== undefined && sub.grade !== null ? `${sub.grade}/${sub.maxGrade}` : '-'}
                              </div>
                              <div>
                                <button 
                                  className="btn-secondary btn-sm"
                                  onClick={() => {
                                    setShowGradeModal(sub);
                                    setGradeData({
                                      grade: sub.grade || 0,
                                      feedback: sub.feedback || ''
                                    });
                                  }}
                                >
                                  {sub.status === 'graded' ? 'Edit' : 'Grade'}
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{padding: '40px', textAlign: 'center', color: '#9ca3af', gridColumn: '1 / -1'}}>
                            No submissions yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Gradebook Section */}
      {gradebook && (
        <div className="gradebook-section">
          <div className="gradebook-header">
            <div>
              <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '4px'}}>Gradebook</h2>
              <p style={{color: '#6b7280', fontSize: '14px'}}>{gradebook.class?.className}</p>
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className="btn-secondary" onClick={() => setShowAddGradeModal(true)}>
                <Plus size={16} />
                Add Manual Grade
              </button>
              <button className="btn-secondary">
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          <div className="gradebook-table">
            <div className="table-header">
              <div>Student</div>
              <div>Total Score</div>
              <div>Max Score</div>
              <div>Average</div>
              <div>Grades</div>
            </div>
            {gradebook.gradebook?.map(entry => (
              <div key={entry.student._id} className="table-row">
                <div className="student-info">
                  <p>{entry.student.name}</p>
                  <small>{entry.student.email}</small>
                </div>
                <div style={{fontWeight: '600'}}>{entry.totalScore}</div>
                <div>{entry.totalMaxScore}</div>
                <div style={{fontWeight: '600', color: entry.average >= 70 ? '#059669' : '#dc2626'}}>
                  {entry.average}%
                </div>
                <div style={{fontSize: '13px', color: '#6b7280'}}>{entry.grades.length} grades</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Assignment</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label>Class</label>
              <select value={newAssignment.classId} onChange={(e) => setNewAssignment({...newAssignment, classId: e.target.value})}>
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.className}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                placeholder="e.g., Homework 1"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Instructions</label>
              <textarea
                value={newAssignment.instructions}
                onChange={(e) => setNewAssignment({...newAssignment, instructions: e.target.value})}
                rows="4"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Total Points</label>
                <input
                  type="number"
                  value={newAssignment.totalPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, totalPoints: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateAssignment}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {showGradeModal && (
        <div className="modal-overlay" onClick={() => setShowGradeModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h2>Grade Submission</h2>
              <button className="btn-icon" onClick={() => setShowGradeModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb'}}>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Student: <strong>{showGradeModal.studentId?.name}</strong></p>
              <p style={{fontSize: '14px', color: '#6b7280', marginTop: '4px'}}>Submitted: {new Date(showGradeModal.submittedAt).toLocaleString()}</p>
            </div>
            <div className="form-group">
              <label>Grade (out of {showGradeModal.assignmentId?.totalPoints})</label>
              <input
                type="number"
                value={gradeData.grade}
                onChange={(e) => setGradeData({...gradeData, grade: parseInt(e.target.value)})}
                min="0"
                max={showGradeModal.assignmentId?.totalPoints}
              />
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea
                value={gradeData.feedback}
                onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                rows="4"
                placeholder="Provide feedback..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowGradeModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleGradeSubmission(showGradeModal._id)}>Submit Grade</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Grade Modal */}
      {showAddGradeModal && (
        <div className="modal-overlay" onClick={() => setShowAddGradeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Manual Grade</h2>
              <button className="btn-icon" onClick={() => setShowAddGradeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label>Student ID</label>
              <input
                type="text"
                value={manualGrade.studentId}
                onChange={(e) => setManualGrade({...manualGrade, studentId: e.target.value})}
                placeholder="Enter student MongoDB ID"
              />
            </div>
            <div className="form-group">
              <label>Class</label>
              <select value={manualGrade.classId} onChange={(e) => setManualGrade({...manualGrade, classId: e.target.value})}>
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.className}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Grade Type</label>
                <select value={manualGrade.gradeType} onChange={(e) => setManualGrade({...manualGrade, gradeType: e.target.value})}>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="participation">Participation</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={manualGrade.title}
                  onChange={(e) => setManualGrade({...manualGrade, title: e.target.value})}
                  placeholder="e.g., Quiz 1"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Score</label>
                <input
                  type="number"
                  value={manualGrade.score}
                  onChange={(e) => setManualGrade({...manualGrade, score: parseInt(e.target.value)})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Max Score</label>
                <input
                  type="number"
                  value={manualGrade.maxScore}
                  onChange={(e) => setManualGrade({...manualGrade, maxScore: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={manualGrade.comments}
                onChange={(e) => setManualGrade({...manualGrade, comments: e.target.value})}
                rows="3"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddGradeModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddManualGrade}>Add Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentsPage;