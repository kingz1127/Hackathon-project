import { Award, BookOpen, Calendar, Clock, FileText, MapPin, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

const StudentClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [expandedClass, setExpandedClass] = useState(null);
  const [classAssignments, setClassAssignments] = useState({});
  const [classGrades, setClassGrades] = useState({});
  const [loading, setLoading] = useState(true);

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
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/classes/student');
      setClasses(data);
    } catch (err) {
      console.error('Error fetching classes:', err);
      alert('Failed to load classes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      // Fetch assignments for this class
      const assignments = await apiCall(`/assignments/student?classId=${classId}`);
      setClassAssignments(prev => ({ ...prev, [classId]: assignments }));

      // Fetch grades for this class
      const grades = await apiCall(`/grades/student/class/${classId}`);
      setClassGrades(prev => ({ ...prev, [classId]: grades }));
    } catch (err) {
      console.error('Error fetching class details:', err);
      alert('Failed to load class details: ' + err.message);
    }
  };

  const handleExpandClass = async (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      await fetchClassDetails(classId);
    }
  };

  const getUpcomingAssignments = (classId) => {
    const assignments = classAssignments[classId] || [];
    const now = new Date();
    return assignments.filter(a => new Date(a.dueDate) > now).slice(0, 3);
  };

  if (loading) {
    return <div style={{padding: '40px', textAlign: 'center'}}>Loading classes...</div>;
  }

  return (
    <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif'}}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header-icon { color: #2563eb; }
        h1 { font-size: 28px; font-weight: 700; color: #111827; }
        .page-header p { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .classes-grid { display: grid; gap: 20px; }
        .class-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
        .class-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .class-card.expanded { border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.1); }
        .class-header { padding: 20px; cursor: pointer; }
        .class-title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 6px; }
        .class-course { color: #6b7280; font-size: 14px; margin-bottom: 12px; }
        .class-meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .class-details { border-top: 1px solid #e5e7eb; padding: 20px; background: #f9fafb; animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-section { background: white; border-radius: 8px; padding: 20px; border: 1px solid #e5e7eb; }
        .section-title { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .info-item { display: flex; justify-content: space-between; padding: 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; }
        .info-label { color: #6b7280; font-size: 14px; }
        .info-value { color: #111827; font-size: 14px; font-weight: 500; }
        .assignment-list { display: flex; flex-direction: column; gap: 12px; }
        .assignment-item { padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
        .assignment-title { font-size: 14px; font-weight: 500; color: #111827; margin-bottom: 4px; }
        .assignment-meta { font-size: 13px; color: #6b7280; }
        .grade-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
        .grade-stat { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
        .stat-value { font-size: 24px; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #6b7280; font-weight: 500; text-transform: uppercase; }
        .grade-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; }
        .grade-title { font-size: 14px; color: #111827; }
        .grade-score { font-size: 14px; font-weight: 600; color: #111827; }
        .empty-text { text-align: center; color: #9ca3af; font-size: 14px; padding: 20px; }
        .empty-state { text-align: center; padding: 60px 20px; color: #9ca3af; background: white; border-radius: 12px; border: 2px dashed #e5e7eb; }
        .empty-state svg { margin: 0 auto 16px; opacity: 0.5; }
        .description { color: #6b7280; font-size: 14px; line-height: 1.6; }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <BookOpen size={32} className="header-icon" />
        <div>
          <h1>My Classes</h1>
          <p>View your enrolled classes, upcoming assignments, and grades</p>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="classes-grid">
        {classes.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <h3>No classes enrolled</h3>
            <p>You are not enrolled in any classes yet</p>
          </div>
        ) : (
          classes.map(cls => (
            <div key={cls._id} className={`class-card ${expandedClass === cls._id ? 'expanded' : ''}`}>
              <div className="class-header" onClick={() => handleExpandClass(cls._id)}>
                <h2 className="class-title">{cls.className}</h2>
                <p className="class-course">{cls.courseId?.name || cls.courseId?.courseName || 'N/A'}</p>
                <div className="class-meta">
                  <span className="meta-item">
                    <User size={14} />
                    {cls.teacherId?.name || 'Unknown Teacher'}
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} />
                    {cls.semester} {cls.academicYear}
                  </span>
                  <span className="meta-item">
                    <Clock size={14} />
                    {cls.schedule?.day} at {cls.schedule?.time}
                  </span>
                  <span className="meta-item">
                    <MapPin size={14} />
                    {cls.room || 'No room'}
                  </span>
                </div>
              </div>

              {expandedClass === cls._id && (
                <div className="class-details">
                  {/* Class Information */}
                  <div style={{marginBottom: '20px'}}>
                    <h3 className="section-title">
                      <BookOpen size={18} />
                      Class Information
                    </h3>
                    <p className="description">{cls.description || 'No description available'}</p>
                    <div style={{marginTop: '16px'}}>
                      <div className="info-item">
                        <span className="info-label">Teacher</span>
                        <span className="info-value">{cls.teacherId?.name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Email</span>
                        <span className="info-value">{cls.teacherId?.email}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Schedule</span>
                        <span className="info-value">
                          {cls.schedule?.day} at {cls.schedule?.time} ({cls.schedule?.duration} mins)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="details-grid">
                    {/* Upcoming Assignments */}
                    <div className="detail-section">
                      <h3 className="section-title">
                        <FileText size={18} />
                        Upcoming Assignments
                      </h3>
                      <div className="assignment-list">
                        {getUpcomingAssignments(cls._id).length > 0 ? (
                          getUpcomingAssignments(cls._id).map(assignment => (
                            <div key={assignment._id} className="assignment-item">
                              <p className="assignment-title">{assignment.title}</p>
                              <p className="assignment-meta">
                                Due: {new Date(assignment.dueDate).toLocaleDateString()} | 
                                {assignment.totalPoints} points
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="empty-text">No upcoming assignments</p>
                        )}
                      </div>
                    </div>

                    {/* Grades */}
                    <div className="detail-section">
                      <h3 className="section-title">
                        <Award size={18} />
                        Grades
                      </h3>
                      {classGrades[cls._id] ? (
                        <>
                          <div className="grade-summary">
                            <div className="grade-stat">
                              <div className="stat-value">{classGrades[cls._id].average}%</div>
                              <div className="stat-label">Average</div>
                            </div>
                            <div className="grade-stat">
                              <div className="stat-value">{classGrades[cls._id].totalScore}</div>
                              <div className="stat-label">Total Score</div>
                            </div>
                            <div className="grade-stat">
                              <div className="stat-value">{classGrades[cls._id].grades?.length || 0}</div>
                              <div className="stat-label">Grades</div>
                            </div>
                          </div>
                          <div>
                            {classGrades[cls._id].grades && classGrades[cls._id].grades.length > 0 ? (
                              classGrades[cls._id].grades.slice(0, 5).map(grade => (
                                <div key={grade._id} className="grade-item">
                                  <span className="grade-title">{grade.title}</span>
                                  <span className="grade-score">
                                    {grade.score}/{grade.maxScore}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="empty-text">No grades yet</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="empty-text">Loading grades...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentClassesPage;