import React from 'react';

// Course Card Component
function CourseCard({ course, onViewDetails }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 60) return 'orange';
    if (progress >= 40) return 'red';
    return '#6b7280';
  };

  return (
    <div
      style={{
        ...styles.courseCard,
        ...(isHovered ? styles.courseCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.courseHeader}>
        <div style={styles.courseIcon}>{course.icon}</div>
        <div style={styles.courseMeta}>
          <span style={styles.courseLevel}>{course.level}</span>
          <span style={styles.courseDuration}>{course.duration}</span>
        </div>
      </div>
      
      <h3 style={styles.courseTitle}>{course.title}</h3>
      <p style={styles.courseDescription}>{course.description}</p>
      
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Progress</span>
          <span style={styles.progressPercentage}>{course.progress}%</span>
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${course.progress}%`,
              backgroundColor: getProgressColor(course.progress)
            }}
          />
        </div>
      </div>
      
      <div style={styles.courseStats}>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>📚</span>
          <span style={styles.statText}>{course.modules} Modules</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>⏱️</span>
          <span style={styles.statText}>{course.hours}h</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statIcon}>👨‍🏫</span>
          <span style={styles.statText}>{course.instructor}</span>
        </div>
      </div>
      
      <button 
        style={styles.viewDetailsBtn}
        onClick={() => onViewDetails(course)}
      >
        View Details
      </button>
    </div>
  );
}

// Filter Button Component
function FilterButton({ label, isActive, onClick }) {
  return (
    <button
      style={{
        ...styles.filterBtn,
        ...(isActive ? styles.filterBtnActive : {})
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function Courses() {
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  const courses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      description: "Master modern web development with React, Node.js, and database integration",
      icon: "🌐",
      level: "Intermediate",
      duration: "6 months",
      progress: 75,
      modules: 12,
      hours: 180,
      instructor: "Mrs Chen",
      category: "Web Development",
      status: "In Progress",
      technologies: ["React", "Node.js", "MongoDB", "Express"]
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      description: "Build strong programming foundations with comprehensive DSA coverage",
      icon: "🔢",
      level: "Beginner",
      duration: "4 months",
      progress: 90,
      modules: 10,
      hours: 120,
      instructor: "Dr Johnson",
      category: "Computer Science",
      status: "Completed",
      technologies: ["Java", "Python", "C++"]
    },
    {
      id: 3,
      title: "Cloud Computing with AWS",
      description: "Learn cloud architecture, deployment, and DevOps practices on AWS",
      icon: "☁️",
      level: "Advanced",
      duration: "5 months",
      progress: 45,
      modules: 15,
      hours: 200,
      instructor: "Ms. Patel",
      category: "Cloud Computing",
      status: "In Progress",
      technologies: ["AWS", "Docker", "Kubernetes", "Terraform"]
    },
    {
      id: 4,
      title: "Mobile App Development",
      description: "Create cross-platform mobile applications using React Native",
      icon: "📱",
      level: "Intermediate",
      duration: "4 months",
      progress: 30,
      modules: 8,
      hours: 150,
      instructor: "Mr. Singh",
      category: "Mobile Development",
      status: "In Progress",
      technologies: ["React Native", "JavaScript", "Redux"]
    },
    {
      id: 5,
      title: "Machine Learning Fundamentals",
      description: "Introduction to ML algorithms, data science, and AI applications",
      icon: "🤖",
      level: "Intermediate",
      duration: "6 months",
      progress: 15,
      modules: 14,
      hours: 220,
      instructor: "Dr. Gupta",
      category: "Data Science",
      status: "Just Started",
      technologies: ["Python", "TensorFlow", "Scikit-learn", "Pandas"]
    },
    {
      id: 6,
      title: "Cybersecurity Essentials",
      description: "Learn security protocols, ethical hacking, and system protection",
      icon: "🔒",
      level: "Advanced",
      duration: "5 months",
      progress: 0,
      modules: 12,
      hours: 160,
      instructor: "Ms. Reddy",
      category: "Security",
      status: "Not Started",
      technologies: ["Python", "Kali Linux", "Wireshark", "Metasploit"]
    }
  ];

  const filters = ['All', 'In Progress', 'Completed', 'Not Started'];
  
  const filteredCourses = courses.filter(course => {
    const matchesFilter = activeFilter === 'All' || course.status === activeFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleViewDetails = (course) => {
    alert(`Viewing details for: ${course.title}\n\nTechnologies: ${course.technologies.join(', ')}\nInstructor: ${course.instructor}\nStatus: ${course.status}`);
  };

  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter(c => c.status === 'In Progress').length,
    completed: courses.filter(c => c.status === 'Completed').length,
    totalHours: courses.reduce((sum, c) => sum + c.hours, 0)
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Courses</h1>
        <p style={styles.subtitle}>Track your learning journey at NIIT</p>
      </div>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{stats.totalCourses}</div>
            <div style={styles.statLabel}>Total Courses</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{stats.inProgress}</div>
            <div style={styles.statLabel}>In Progress</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{stats.completed}</div>
            <div style={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statContent}>
            <div style={styles.statNumber}>{stats.totalHours}</div>
            <div style={styles.statLabel}>Total Hours</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={styles.controlsSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.searchIcon}>🔍</span>
        </div>
        
        <div style={styles.filtersContainer}>
          {filters.map(filter => (
            <FilterButton
              key={filter}
              label={filter}
              isActive={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div style={styles.coursesGrid}>
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No courses found</h3>
          <p style={styles.emptyDescription}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    marginBottom: '30px'
  },
  title: {
    color: "#0a174e",
    fontWeight: "bold",
    fontSize: "3rem",
    margin: 0,
    marginBottom: "0.5rem"
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.2rem",
    margin: 0
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
 
  statIcon: {
    fontSize: '2rem',
    backgroundColor: '#f1f5f9',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '50px',
    height: '50px'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginTop: '4px'
  },
  controlsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    gap: '20px',
    flexWrap: 'wrap'
  },
  searchContainer: {
    position: 'relative',
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b'
  },
  filtersContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '8px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '25px',
    marginBottom: '30px'
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  courseCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  courseIcon: {
    fontSize: '2.5rem',
    backgroundColor: '#f1f5f9',
    padding: '12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  courseMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  courseLevel: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  courseDuration: {
    color: '#64748b',
    fontSize: '0.85rem'
  },
  courseTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    lineHeight: 1.3
  },
  courseDescription: {
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: '1rem',
    lineHeight: 1.5,
    marginBottom: '20px'
  },
  progressSection: {
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  progressLabel: {
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '500'
  },
  progressPercentage: {
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '600'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  courseStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
 
  statText: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500'
  },
  viewDetailsBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#374151'
  },
  emptyDescription: {
    fontSize: '1rem',
    lineHeight: 1.5
  }
};