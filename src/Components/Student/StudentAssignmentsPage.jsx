import { AlertCircle, Award, Clock, Download, FileText, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [gradeReport, setGradeReport] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments' or 'grades'
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [classes, setClasses] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [submissionData, setSubmissionData] = useState({
    content: '',
    attachments: []
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
      
      // Fetch classes
      const classesData = await apiCall('/classes/student');
      setClasses(classesData);

      // Fetch assignments
      const params = new URLSearchParams();
      if (filterClass !== 'all') params.append('classId', filterClass);
      
      const assignmentsData = await apiCall(`/assignments/student?${params.toString()}`);
      setAssignments(assignmentsData);

      // Fetch submissions
      const submissionsData = await apiCall(`/submissions/student?${params.toString()}`);
      setSubmissions(submissionsData);

      // Fetch grade report
      if (activeTab === 'grades') {
        const reportData = await apiCall('/grades/student/report');
        setGradeReport(reportData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      await apiCall('/submissions/student', {
        method: 'POST',
        body: JSON.stringify({
          assignmentId: showSubmitModal._id,
          ...submissionData
        }),
      });
      setShowSubmitModal(null);
      setSubmissionData({ content: '', attachments: [] });
      fetchData();
      alert('Assignment submitted successfully!');
    } catch (err) {
      alert('Failed to submit assignment: ' + err.message);
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = submissions.find(s => s.assignmentId?._id === assignmentId);
    if (!submission) return { status: 'not_submitted', label: 'Not Submitted', color: '#9ca3af' };
    if (submission.status === 'graded') return { status: 'graded', label: 'Graded', color: '#059669' };
    if (submission.status === 'late') return { status: 'late', label: 'Late', color: '#dc2626' };
    return { status: 'submitted', label: 'Submitted', color: '#2563eb' };
  };

  const getAssignmentsByStatus = (status) => {
    const now = new Date();
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate);
      const submission = submissions.find(s => s.assignmentId?._id === a._id);
      
      if (status === 'pending') return !submission && dueDate > now;
      if (status === 'submitted') return submission && submission.status !== 'graded';
      if (status === 'graded') return submission && submission.status === 'graded';
      if (status === 'overdue') return !submission && dueDate < now;
      return true;
    });
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
        .tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; }
        .tab { padding: 12px 24px; background: none; border: none; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; position: relative; transition: color 0.2s; }
        .tab.active { color: #2563eb; }
        .tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: #2563eb; }
        .filters { display: flex; gap: 12px; margin-bottom: 24px; }
        .filters select { padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; }
        .status-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .status-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .status-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .status-count { font-size: 32px; font-weight: 700; margin-bottom: 4px; }
        .status-label { font-size: 14px; color: #6b7280; font-weight: 500; }
        .assignments-grid { display: grid; gap: 16px; }
        .assignment-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; transition: all 0.2s; }
        .assignment-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .assignment-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
        .assignment-title { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 4px; }
        .assignment-class { font-size: 14px; color: #6b7280; }
        .assignment-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        .assignment-actions { display: flex; gap: 8px; }
        .btn-primary { background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-secondary { background: white; color: #374151; border: 1px solid #d1d5db; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-secondary:hover { background: #f3f4f6; }
        .btn-sm { padding: 8px 16px; font-size: 13px; }
        .btn-icon { background: none; border: none; padding: 8px; cursor: pointer; border-radius: 6px; color: #6b7280; transition: all 0.2s; }
        .btn-icon:hover { background: #f3f4f6; color: #111827; }
        .submission-info { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 12px; border: 1px solid #e5e7eb; }
        .submission-grade { font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 8px; }
        .submission-feedback { font-size: 14px; color: #6b7280; line-height: 1.6; }
        .grade-report { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb; }
        .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .overall-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
        .stat-value { font-size: 36px; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
        .stat-label { font-size: 14px; color: #6b7280; font-weight: 500; }
        .class-grades { margin-bottom: 24px; }
        .class-grade-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
        .class-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .class-name { font-size: 18px; font-weight: 600; color: #111827; }
        .class-average { font-size: 24px; font-weight: 700; color: #2563eb; }
        .grades-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
        .grade-item { display: flex; justify-content: space-between; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
        .grade-title { font-size: 14px; color: #111827; }
        .grade-score { font-size: 14px; font-weight: 600; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #e5e7eb; }
        .modal-header h2 { font-size: 20px; font-weight: 600; color: #111827; }
        .form-group { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 14px; font-weight: 500; color: #374151; }
        .form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; width: 100%; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #2563eb; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 20px; border-top: 1px solid #e5e7eb; background: #f9fafb; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; background: white; border-radius: 12px; border: 2px dashed #e5e7eb; }
        .empty-state svg { margin: 0 auto 16px; opacity: 0.5; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <FileText size={32} className="header-icon" />
          <div>
            <h1>My Assignments & Grades</h1>
            <p>Submit assignments, view grades, and track your progress</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => {
          setActiveTab('assignments');
          fetchData();
        }}>
          Assignments
        </button>
        <button className={`tab ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => {
          setActiveTab('grades');
          fetchData();
        }}>
          Grades
        </button>
      </div>

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <>
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
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          {/* Status Cards */}
          <div className="status-cards">
            <div className="status-card">
              <div className="status-count" style={{color: '#f59e0b'}}>{getAssignmentsByStatus('pending').length}</div>
              <div className="status-label">Pending</div>
            </div>
            <div className="status-card">
              <div className="status-count" style={{color: '#2563eb'}}>{getAssignmentsByStatus('submitted').length}</div>
              <div className="status-label">Submitted</div>
            </div>
            <div className="status-card">
              <div className="status-count" style={{color: '#059669'}}>{getAssignmentsByStatus('graded').length}</div>
              <div className="status-label">Graded</div>
            </div>
            <div className="status-card">
              <div className="status-count" style={{color: '#dc2626'}}>{getAssignmentsByStatus('overdue').length}</div>
              <div className="status-label">Overdue</div>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="assignments-grid">
            {assignments.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <h3>No assignments found</h3>
                <p>You don't have any assignments yet</p>
              </div>
            ) : (
              assignments.map(assignment => {
                const status = getSubmissionStatus(assignment._id);
                const submission = submissions.find(s => s.assignmentId?._id === assignment._id);
                const isOverdue = new Date(assignment.dueDate) < new Date() && !submission;

                return (
                  <div key={assignment._id} className="assignment-card">
                    <div className="assignment-header">
                      <div>
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <p className="assignment-class">{assignment.classId?.className || 'Unknown Class'}</p>
                      </div>
                      <div className="assignment-actions">
                        {!submission && (
                          <button className="btn-primary btn-sm" onClick={() => setShowSubmitModal(assignment)}>
                            <Upload size={16} />
                            Submit
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="assignment-meta">
                      <span className="meta-item">
                        <Clock size={14} />
                        Due: {new Date(assignment.dueDate).toLocaleString()}
                      </span>
                      <span className="meta-item">
                        <Award size={14} />
                        {assignment.totalPoints} points
                      </span>
                      <span className="status-badge" style={{backgroundColor: `${status.color}20`, color: status.color}}>
                        {status.label}
                      </span>
                      {isOverdue && (
                        <span className="meta-item" style={{color: '#dc2626'}}>
                          <AlertCircle size={14} />
                          Overdue
                        </span>
                      )}
                    </div>

                    <p style={{color: '#6b7280', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6'}}>
                      {assignment.description || 'No description'}
                    </p>

                    {submission && (
                      <div className="submission-info">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                          <div>
                            <p style={{fontSize: '13px', color: '#6b7280', marginBottom: '4px'}}>
                              Submitted: {new Date(submission.submittedAt).toLocaleString()}
                            </p>
                            {submission.status === 'graded' && (
                              <>
                                <div className="submission-grade">
                                  {submission.grade}/{submission.maxGrade}
                                </div>
                                {submission.feedback && (
                                  <div className="submission-feedback">
                                    <strong>Feedback:</strong> {submission.feedback}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && gradeReport && (
        <div className="grade-report">
          <div className="report-header">
            <div>
              <h2 style={{fontSize: '24px', fontWeight: '600', marginBottom: '4px'}}>Grade Report</h2>
              <p style={{color: '#6b7280', fontSize: '14px'}}>Comprehensive overview of your academic performance</p>
            </div>
            <button className="btn-secondary">
              <Download size={16} />
              Download Transcript
            </button>
          </div>

          {/* Overall Stats */}
          <div className="overall-stats">
            <div className="stat-card">
              <div className="stat-value">{gradeReport.overallAverage}%</div>
              <div className="stat-label">Overall Average</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{gradeReport.totalClasses}</div>
              <div className="stat-label">Total Classes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {gradeReport.report.reduce((sum, r) => sum + (r.grades?.length || 0), 0)}
              </div>
              <div className="stat-label">Total Grades</div>
            </div>
          </div>

          {/* Class Grades */}
          <div className="class-grades">
            <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Grades by Class</h3>
            {gradeReport.report.map(classReport => (
              <div key={classReport.class._id} className="class-grade-card">
                <div className="class-header">
                  <div>
                    <h4 className="class-name">{classReport.class.className}</h4>
                    <p style={{fontSize: '13px', color: '#6b7280'}}>
                      {classReport.class.semester} {classReport.class.academicYear}
                    </p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div className="class-average">{classReport.average}%</div>
                    <p style={{fontSize: '13px', color: '#6b7280'}}>
                      {classReport.totalScore}/{classReport.totalMaxScore}
                    </p>
                  </div>
                </div>

                {classReport.grades && classReport.grades.length > 0 && (
                  <div className="grades-list">
                    {classReport.grades.map(grade => (
                      <div key={grade._id} className="grade-item">
                        <span className="grade-title">{grade.title}</span>
                        <span className="grade-score" style={{color: (grade.score / grade.maxScore) >= 0.7 ? '#059669' : '#dc2626'}}>
                          {grade.score}/{grade.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Submit Assignment</h2>
              <button className="btn-icon" onClick={() => setShowSubmitModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{padding: '20px', borderBottom: '1px solid #e5e7eb'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '4px'}}>{showSubmitModal.title}</h3>
              <p style={{fontSize: '14px', color: '#6b7280'}}>
                Due: {new Date(showSubmitModal.dueDate).toLocaleString()}
              </p>
            </div>
            <div className="form-group">
              <label>Submission Content</label>
              <textarea
                value={submissionData.content}
                onChange={(e) => setSubmissionData({...submissionData, content: e.target.value})}
                rows="6"
                placeholder="Enter your submission or describe your work..."
              />
            </div>
            <div className="form-group">
              <label>Attachment URL (optional)</label>
              <input
                type="text"
                placeholder="https://example.com/file.pdf"
                onChange={(e) => setSubmissionData({
                  ...submissionData,
                  attachments: e.target.value ? [{ filename: 'attachment', url: e.target.value }] : []
                })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSubmitModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSubmitAssignment}>Submit Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;