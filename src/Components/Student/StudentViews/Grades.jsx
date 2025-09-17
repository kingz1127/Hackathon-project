import React from 'react';

// Grade Card Component
function GradeCard({ grade }) {
  const getGradeColor = (score) => {
    if (score >= 90) return '#10b981'; // Green for A
    if (score >= 80) return '#3b82f6'; // Blue for B
    if (score >= 70) return '#f59e0b'; // Yellow for C
    if (score >= 60) return '#f97316'; // Orange for D
    return '#ef4444'; // Red for F
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeIcon = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📈';
    return '⚠️';
  };

  return (
    <div style={{...styles.gradeCard, borderLeft: `4px solid ${getGradeColor(grade.score)}`}}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={styles.assignmentTitle}>{grade.assignment}</h3>
          <p style={styles.courseName}>{grade.course}</p>
        </div>
        <div style={styles.gradeDisplay}>
          <div style={{...styles.letterGrade, backgroundColor: getGradeColor(grade.score)}}>
            {getLetterGrade(grade.score)}
          </div>
          <div style={styles.scoreDisplay}>
            <span style={{...styles.scoreText, color: getGradeColor(grade.score)}}>
              {grade.score}%
            </span>
          </div>
        </div>
      </div>
      
      <div style={styles.gradeDetails}>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Points Earned:</span>
          <span style={styles.detailValue}>{grade.pointsEarned} / {grade.totalPoints}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Submitted:</span>
          <span style={styles.detailValue}>{grade.submittedDate}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Graded:</span>
          <span style={styles.detailValue}>{grade.gradedDate}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Instructor:</span>
          <span style={styles.detailValue}>{grade.instructor}</span>
        </div>
      </div>

      {grade.feedback && (
        <div style={styles.feedbackSection}>
          <h4 style={styles.feedbackTitle}>Instructor Feedback:</h4>
          <p style={styles.feedbackText}>{grade.feedback}</p>
        </div>
      )}

      <div style={styles.performanceIndicator}>
        <span style={styles.performanceIcon}>{getGradeIcon(grade.score)}</span>
        <span style={{...styles.performanceText, color: getGradeColor(grade.score)}}>
          {grade.score >= 90 ? 'Excellent Work!' : 
           grade.score >= 80 ? 'Good Job!' : 
           grade.score >= 70 ? 'Keep Improving!' : 
           grade.score >= 60 ? 'Needs Work' : 'Requires Attention'}
        </span>
      </div>
    </div>
  );
}

// Course Overview Component
function CourseOverview({ courseData }) {
  const getOverallGradeColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={styles.courseOverview}>
      <div style={styles.courseHeader}>
        <div>
          <h3 style={styles.courseTitle}>{courseData.name}</h3>
          <p style={styles.courseInstructor}>Instructor: {courseData.instructor}</p>
        </div>
        <div style={styles.courseGrade}>
          <div style={{...styles.overallGrade, color: getOverallGradeColor(courseData.overallGrade)}}>
            {courseData.overallGrade}%
          </div>
          <div style={styles.gradeLabel}>Overall</div>
        </div>
      </div>
      
      <div style={styles.courseStats}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{courseData.assignments}</span>
          <span style={styles.statLabel}>Assignments</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{courseData.completed}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{courseData.pending}</span>
          <span style={styles.statLabel}>Pending</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{courseData.credits}</span>
          <span style={styles.statLabel}>Credits</span>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={styles.progressLabel}>Course Progress</div>
        <div style={styles.progressTrack}>
          <div 
            style={{
              ...styles.progressFill, 
              width: `${courseData.progress}%`,
              backgroundColor: getOverallGradeColor(courseData.overallGrade)
            }}
          ></div>
        </div>
        <span style={styles.progressText}>{courseData.progress}% Complete</span>
      </div>
    </div>
  );
}

// GPA Calculator Component
function GPAOverview({ gpaData }) {
  return (
    <div style={styles.gpaContainer}>
      <div style={styles.gpaCard}>
        <div style={styles.gpaHeader}>
          <h3 style={styles.gpaTitle}>Academic Performance</h3>
        </div>
        <div style={styles.gpaStats}>
          <div style={styles.gpaItem}>
            <div style={{...styles.gpaValue, color: '#3b82f6'}}>{gpaData.currentGPA}</div>
            <div style={styles.gpaLabel}>Current GPA</div>
          </div>
          <div style={styles.gpaItem}>
            <div style={{...styles.gpaValue, color: '#10b981'}}>{gpaData.cumulativeGPA}</div>
            <div style={styles.gpaLabel}>Cumulative GPA</div>
          </div>
          <div style={styles.gpaItem}>
            <div style={{...styles.gpaValue, color: '#8b5cf6'}}>{gpaData.totalCredits}</div>
            <div style={styles.gpaLabel}>Total Credits</div>
          </div>
          <div style={styles.gpaItem}>
            <div style={{...styles.gpaValue, color: '#f59e0b'}}>{gpaData.rank}</div>
            <div style={styles.gpaLabel}>Class Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Component
function GradeFilter({ activeFilter, setActiveFilter, activeSemester, setActiveSemester }) {
  const filters = [
    { key: 'all', label: 'All Grades' },
    { key: 'recent', label: 'Recent' },
    { key: 'high', label: 'High Scores (90+)' },
    { key: 'needs-improvement', label: 'Needs Improvement (<70)' }
  ];

  const semesters = [
    { key: 'current', label: 'Current Semester' },
    { key: 'fall-2025', label: 'Fall 2025' },
    { key: 'spring-2025', label: 'Spring 2025' },
    { key: 'fall-2025', label: 'Fall 2025' }
  ];

  return (
    <div style={styles.filterContainer}>
      <div style={styles.filterSection}>
        <h4 style={styles.filterTitle}>Filter by Performance</h4>
        <div style={styles.filterButtons}>
          {filters.map(filter => (
            <button
              key={filter.key}
              style={{
                ...styles.filterButton,
                ...(activeFilter === filter.key ? styles.activeFilter : {})
              }}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={styles.filterSection}>
        <h4 style={styles.filterTitle}>Semester</h4>
        <select 
          value={activeSemester} 
          onChange={(e) => setActiveSemester(e.target.value)}
          style={styles.semesterSelect}
        >
          {semesters.map(semester => (
            <option key={semester.key} value={semester.key}>
              {semester.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function Grades() {
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [activeSemester, setActiveSemester] = React.useState('current');

  // Sample GPA Data
  const gpaData = {
    currentGPA: 3.67,
    cumulativeGPA: 3.52,
    totalCredits: 84,
    rank: "Top 15%"
  };

  // Sample Course Data
  const courseData = [
    {
      name: "Full Stack Development",
      instructor: "Dr. Johnson",
      overallGrade: 87,
      assignments: 8,
      completed: 6,
      pending: 2,
      credits: 4,
      progress: 75
    },
    {
      name: "Database Systems",
      instructor: "Prof. Williams",
      overallGrade: 92,
      assignments: 6,
      completed: 5,
      pending: 1,
      credits: 3,
      progress: 83
    },
    {
      name: "DevOps & CI/CD",
      instructor: "Mr. Anderson",
      overallGrade: 78,
      assignments: 7,
      completed: 4,
      pending: 3,
      credits: 3,
      progress: 57
    }
  ];

  // Sample Grades Data
  const [grades] = React.useState([
    {
      id: 1,
      assignment: "React E-commerce Platform",
      course: "Full Stack Development",
      score: 92,
      pointsEarned: 92,
      totalPoints: 100,
      submittedDate: "Dec 15, 2025",
      gradedDate: "Dec 17, 2025",
      instructor: "Dr. Johnson",
      feedback: "Excellent implementation of React hooks and state management. Great attention to responsive design and user experience. Well-structured code with proper component organization."
    },
    {
      id: 2,
      assignment: "Database Design Project",
      course: "Database Systems",
      score: 89,
      pointsEarned: 80,
      totalPoints: 90,
      submittedDate: "Dec 10, 2025",
      gradedDate: "Dec 12, 2025",
      instructor: "Prof. Williams",
      feedback: "Strong understanding of normalization principles and relationship design. Minor issues with indexing strategy, but overall solid work."
    },
    {
      id: 3,
      assignment: "REST API Development",
      course: "Backend Development",
      score: 85,
      pointsEarned: 68,
      totalPoints: 80,
      submittedDate: "Dec 8, 2025",
      gradedDate: "Dec 10, 2025",
      instructor: "Ms. Chen",
      feedback: "Good implementation of RESTful principles. Authentication middleware works well. Could improve error handling and add more comprehensive testing."
    },
    {
      id: 4,
      assignment: "Cloud Deployment",
      course: "DevOps & CI/CD",
      score: 78,
      pointsEarned: 94,
      totalPoints: 120,
      submittedDate: "Dec 5, 2025",
      gradedDate: "Dec 8, 2025",
      instructor: "Mr. Anderson",
      feedback: "Docker configuration is correct, but CI/CD pipeline needs optimization. Infrastructure setup shows understanding of cloud concepts."
    },
    {
      id: 5,
      assignment: "Machine Learning Model",
      course: "Data Science",
      score: 95,
      pointsEarned: 81,
      totalPoints: 85,
      submittedDate: "Dec 3, 2025",
      gradedDate: "Dec 5, 2025",
      instructor: "Dr. Kim",
      feedback: "Outstanding work! Model accuracy is impressive, and the data preprocessing pipeline is well-designed. Excellent documentation and analysis."
    },
    {
      id: 6,
      assignment: "Security Audit Report",
      course: "Cybersecurity",
      score: 88,
      pointsEarned: 66,
      totalPoints: 75,
      submittedDate: "Nov 28, 2025",
      gradedDate: "Dec 1, 2025",
      instructor: "Prof. Brown",
      feedback: "Comprehensive security analysis with actionable recommendations. Good identification of vulnerabilities. Report formatting could be improved."
    },
    {
      id: 7,
      assignment: "Mobile App Prototype",
      course: "Mobile Development",
      score: 82,
      pointsEarned: 78,
      totalPoints: 95,
      submittedDate: "Nov 25, 2025",
      gradedDate: "Nov 27, 2025",
      instructor: "Ms. Taylor",
      feedback: "Solid React Native implementation with good UI/UX design. Navigation flow is intuitive. Performance optimization could be enhanced."
    },
    {
      id: 8,
      assignment: "Algorithm Analysis",
      course: "Data Structures",
      score: 67,
      pointsEarned: 47,
      totalPoints: 70,
      submittedDate: "Nov 20, 2025",
      gradedDate: "Nov 23, 2025",
      instructor: "Dr. Martinez",
      feedback: "Understanding of basic algorithms is evident, but time complexity analysis needs improvement. Practice more with dynamic programming concepts."
    }
  ]);

  // Filter grades based on active filter and semester
  const filteredGrades = grades.filter(grade => {
    if (activeFilter === 'recent') {
      const gradeDate = new Date(grade.gradedDate);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return gradeDate >= twoWeeksAgo;
    }
    if (activeFilter === 'high') return grade.score >= 90;
    if (activeFilter === 'needs-improvement') return grade.score < 70;
    return true; // 'all' filter
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>My Grades</h1>
        <p style={styles.pageSubtitle}>Track your academic performance and progress</p>
      </div>

      <GPAOverview gpaData={gpaData} />

      <div style={styles.coursesSection}>
        <h2 style={styles.sectionTitle}>Course Overview</h2>
        <div style={styles.courseGrid}>
          {courseData.map((course, index) => (
            <CourseOverview key={index} courseData={course} />
          ))}
        </div>
      </div>
      
      <GradeFilter 
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeSemester={activeSemester}
        setActiveSemester={setActiveSemester}
      />

      <div style={styles.gradesSection}>
        <h2 style={styles.sectionTitle}>Individual Grades</h2>
        {filteredGrades.length === 0 ? (
          <div style={styles.noGrades}>
            <div style={styles.noGradesIcon}>📊</div>
            <h3 style={styles.noGradesTitle}>No grades found</h3>
            <p style={styles.noGradesText}>No grades match the selected filter criteria.</p>
          </div>
        ) : (
          <div style={styles.gradesGrid}>
            {filteredGrades.map(grade => (
              <GradeCard key={grade.id} grade={grade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '30px'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#0a174e',
    margin: '0 0 8px 0'
  },
  pageSubtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0
  },
  gpaContainer: {
    marginBottom: '30px'
  },
  gpaCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  gpaHeader: {
    marginBottom: '20px'
  },
  gpaTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  gpaStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '30px'
  },
  gpaItem: {
    textAlign: 'center'
  },
  gpaValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 8px 0'
  },
  gpaLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  },
  coursesSection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 20px 0'
  },
  courseGrid: {
    display: 'grid',
    gap: '20px'
  },
  courseOverview: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  courseTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  courseInstructor: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0
  },
  courseGrade: {
    textAlign: 'center'
  },
  overallGrade: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
  },
  gradeLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  courseStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  statItem: {
    textAlign: 'center',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    display: 'block',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  progressBar: {
    marginTop: '20px'
  },
  progressLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '8px',
    fontWeight: '500'
  },
  progressTrack: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '0.75rem',
    color: '#64748b'
  },
  filterContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '30px',
    alignItems: 'start'
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  filterTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  filterButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  semesterSelect: {
    padding: '8px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '200px'
  },
  gradesSection: {
    marginTop: '20px'
  },
  gradesGrid: {
    display: 'grid',
    gap: '20px'
  },
  gradeCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  assignmentTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 4px 0'
  },
  courseName: {
    fontSize: '0.875rem',
    color: '#3b82f6',
    margin: 0,
    fontWeight: '500'
  },
  gradeDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  letterGrade: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreDisplay: {
    textAlign: 'center'
  },
  scoreText: {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  gradeDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: '600'
  },
  feedbackSection: {
    padding: '16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    marginBottom: '16px'
  },
  feedbackTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  feedbackText: {
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: '1.6',
    margin: 0
  },
  performanceIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  performanceIcon: {
    fontSize: '1.25rem'
  },
  performanceText: {
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  noGrades: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  noGradesIcon: {
    fontSize: '4rem',
    marginBottom: '16px'
  },
  noGradesTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 8px 0'
  },
  noGradesText: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0
  }
};