import React, { useState, useEffect } from "react";
import { useNotification } from '../../context/NotificationContext';
import styles from './AdminNotification.module.css';

function AdminNotification() {
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('finance');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [registrationAdminNotes, setRegistrationAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [registrationStats, setRegistrationStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');

  // Registration status options
  const REGISTRATION_STATUSES = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  };

  const REGISTRATION_STATUS_LABELS = {
    [REGISTRATION_STATUSES.PENDING]: 'Pending',
    [REGISTRATION_STATUSES.UNDER_REVIEW]: 'Under Review',
    [REGISTRATION_STATUSES.APPROVED]: 'Approved',
    [REGISTRATION_STATUSES.REJECTED]: 'Rejected'
  };

  const REGISTRATION_STATUS_COLORS = {
    [REGISTRATION_STATUSES.PENDING]: '#ffc107',
    [REGISTRATION_STATUSES.UNDER_REVIEW]: '#17a2b8',
    [REGISTRATION_STATUSES.APPROVED]: '#28a745',
    [REGISTRATION_STATUSES.REJECTED]: '#dc3545'
  };

   const filteredRegistrationData = registrationData.filter(submission => {
    const matchesSearch = 
      submission.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.Email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.Course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.PhoneNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || submission.Course === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });


  // Fetch all data from backend
  useEffect(() => {
    fetchSubscriptions();
    fetchRegistrationData();
    fetchRegistrationStatistics();
  }, []);

  const fetchSubscriptions = async () => {
  try {
    setLoading(true);
    
    // Fetch payment submissions from database
    const allResponse = await fetch('http://localhost:5000/api/payment-submissions/admin/all-submissions');
    
    if (allResponse.ok) {
      const allData = await allResponse.json();
      if (allData.success) {
        setFinanceData(allData.submissions || []);
      }
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    // Fallback to empty array instead of mock data
    setFinanceData([]);
  } finally {
    setLoading(false);
  }
};

  // Fetch registration data
  const fetchRegistrationData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/all-registrations');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRegistrationData(data.submissions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      // Use mock data as fallback
      setRegistrationData([
        { 
          id: 1, 
          FullName: "Mike Johnson", 
          Email: "mike@example.com", 
          Course: "Computer Science", 
          status: "pending", 
          submittedAt: new Date().toISOString(),
          PhoneNumber: "+1234567890",
          Grade: "Grade 10",
          Country: "United States",
          Guardian: "John Johnson",
          GuardianPhoneNumber: "+1234567891",
          StateOfOrigin: "California",
          Address: "123 Main St",
          Gender: "Male",
          DOfB: "2005-05-15" 
        },
        { 
          id: 2, 
          FullName: "Sarah Wilson", 
          Email: "sarah@example.com", 
          Course: "Business Administration", 
          status: "approved", 
          submittedAt: new Date().toISOString(),
          studentId: "STU78281",
          PhoneNumber: "+1234567892",
          Grade: "Grade 11",
          Country: "Canada",
          Guardian: "Mary Wilson",
          GuardianPhoneNumber: "+1234567893",
          StateOfOrigin: "Ontario",
          Address: "456 Oak Ave",
          Gender: "Female",
          DOfB: "2004-08-22"
        }
      ]);
    }
  };

  // Fetch registration statistics
  const fetchRegistrationStatistics = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/registration-statistics');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRegistrationStats(data.statistics);
        }
      }
    } catch (error) {
      console.error('Error fetching registration statistics:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReview = (submission) => {
    setSelectedSubmission(submission);
    setAdminNotes('');
    setShowReviewModal(true);
  };

  const handleRegistrationReview = (submission) => {
    setSelectedRegistration(submission);
    setRegistrationAdminNotes(submission.adminNotes || '');
    setShowRegistrationModal(true);
  };

  // // Update payment status (approve/decline)
  // const updatePaymentStatus = async (submissionId, status, notes) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/payment-submissions/admin/update-status/${submissionId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         status: status,
  //         adminNotes: notes
  //       })
  //     });

  //     const result = await response.json();
      
  //     if (result.success) {
  //       // Refresh the submissions data
  //       fetchSubscriptions();
        
  //       // Show success notification
  //       addNotification({
  //         id: Date.now(),
  //         message: `Payment ${status} successfully`,
  //         type: status === 'approved' ? 'success' : 'warning'
  //       });
  //     } else {
  //       throw new Error(result.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating payment status:', error);
  //     addNotification({
  //       id: Date.now(),
  //       message: 'Failed to update payment status',
  //       type: 'error'
  //     });
  //   }
  // };


  // In your AdminNotification.jsx - update the approve function
const updatePaymentStatus = async (submissionId, status, approvedAmount = null) => {
  try {
    console.log(`✅ Approving submission: ${submissionId}`);
    
    const requestBody = {
      status,
      approvedAmount: approvedAmount || undefined,
      notes: `Approved by admin on ${new Date().toLocaleDateString()}`
    };

    // Remove undefined values
    Object.keys(requestBody).forEach(key => {
      if (requestBody[key] === undefined) {
        delete requestBody[key];
      }
    });

    const response = await fetch(
      `http://localhost:5000/api/payment-submissions/admin/update-status/${submissionId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Payment status updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};


  const renderFilters = () => (
    <div className={styles.filtersContainer}>
      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by name, email, course, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>
      
      <div className={styles.filterGroup}>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select 
          value={courseFilter} 
          onChange={(e) => setCourseFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Courses</option>
          {[...new Set(registrationData.map(item => item.Course))].map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>

        <button 
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setCourseFilter('all');
          }}
          className={styles.clearFilters}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  // Update registration status
  const updateRegistrationStatus = async (submissionId, status, notes) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/update-registration/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          adminNotes: notes,
          reviewedBy: 'admin'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        fetchRegistrationData();
        fetchRegistrationStatistics();
        addNotification({
          id: Date.now(),
          message: `Registration ${REGISTRATION_STATUS_LABELS[status]} successfully`,
          type: status === REGISTRATION_STATUSES.APPROVED ? 'success' : 
                status === REGISTRATION_STATUSES.REJECTED ? 'error' : 'warning'
        });
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      addNotification({
        id: Date.now(),
        message: 'Failed to update registration status',
        type: 'error'
      });
      return false;
    }
  };

  // ✅ UPDATED: Prevent double approval
  const handleApprove = () => {
    if (!selectedSubmission) {
      console.error('❌ No selected submission for approval');
      return;
    }
    
    // ✅ CHECK: Prevent approving already approved submissions
    if (selectedSubmission.status === 'approved') {
      addNotification({
        id: Date.now(),
        message: 'This payment has already been approved',
        type: 'warning'
      });
      return;
    }

    // ✅ CHECK: Prevent approving declined submissions
    if (selectedSubmission.status === 'declined') {
      addNotification({
        id: Date.now(),
        message: 'This payment has been declined and cannot be approved',
        type: 'warning'
      });
      return;
    }
    
    // Use submissionId instead of id
    const submissionId = selectedSubmission.submissionId || selectedSubmission.id;
    console.log('✅ Approving submission:', submissionId);
    
    if (!submissionId) {
      addNotification({
        id: Date.now(),
        message: 'Error: Cannot find submission ID',
        type: 'error'
      });
      return;
    }
    
    updatePaymentStatus(submissionId, 'approved', adminNotes);
    setShowReviewModal(false);
    setSelectedSubmission(null);
    setAdminNotes('');
  };

  // ✅ UPDATED: Prevent double decline
  const handleDecline = () => {
    if (!selectedSubmission) {
      console.error('❌ No selected submission for decline');
      return;
    }
    
    // ✅ CHECK: Prevent declining already declined submissions
    if (selectedSubmission.status === 'declined') {
      addNotification({
        id: Date.now(),
        message: 'This payment has already been declined',
        type: 'warning'
      });
      return;
    }

    // ✅ CHECK: Prevent declining approved submissions
    if (selectedSubmission.status === 'approved') {
      addNotification({
        id: Date.now(),
        message: 'This payment has been approved and cannot be declined',
        type: 'warning'
      });
      return;
    }
    
    // Use submissionId instead of id
    const submissionId = selectedSubmission.submissionId || selectedSubmission.id;
    console.log('❌ Declining submission:', submissionId);
    
    if (!submissionId) {
      addNotification({
        id: Date.now(),
        message: 'Error: Cannot find submission ID',
        type: 'error'
      });
      return;
    }
    
    updatePaymentStatus(submissionId, 'declined', adminNotes);
    setShowReviewModal(false);
    setSelectedSubmission(null);
    setAdminNotes('');
  };

  // Handle registration status update
  const handleRegistrationStatusUpdate = async (status) => {
    if (!selectedRegistration) return;

    if (status === REGISTRATION_STATUSES.REJECTED && !registrationAdminNotes.trim()) {
      addNotification({
        id: Date.now(),
        message: 'Please provide a reason for rejection',
        type: 'warning'
      });
      return;
    }

    const success = await updateRegistrationStatus(
      selectedRegistration.id, 
      status, 
      registrationAdminNotes
    );

    if (success) {
      setShowRegistrationModal(false);
      setSelectedRegistration(null);
      setRegistrationAdminNotes('');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'declined':
        return styles.statusDeclined;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusPending;
    }
  };

  // Enhanced registration statistics display
  const renderRegistrationStatistics = () => {
    if (!registrationStats) return null;

    return (
      <div className={styles.statisticsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3>Total Registrations</h3>
            <p className={styles.statValue}>{registrationStats.total}</p>
            <p className={styles.statNote}>All submissions</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statContent}>
            <h3>Pending Review</h3>
            <p className={styles.statValue}>{registrationStats.pending}</p>
            <p className={styles.statNote}>Awaiting action</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>Approved</h3>
            <p className={styles.statValue}>{registrationStats.approved}</p>
            <p className={styles.statNote}>Students created</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>❌</div>
          <div className={styles.statContent}>
            <h3>Rejected</h3>
            <p className={styles.statValue}>{registrationStats.rejected}</p>
            <p className={styles.statNote}>Not approved</p>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const pendingFinanceCount = financeData.filter(item => item.status === 'pending').length;
  const pendingRegistrationCount = registrationData.filter(item => item.status === 'pending').length;
  const approvedFinanceCount = financeData.filter(item => item.status === 'approved').length;
  const approvedRegistrationCount = registrationData.filter(item => item.status === 'approved').length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage student finances and registrations</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <h3>Pending Payments</h3>
            <p className={styles.statValue}>{pendingFinanceCount}</p>
            <p className={styles.statNote}>Awaiting approval</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <h3>Pending Registrations</h3>
            <p className={styles.statValue}>{pendingRegistrationCount}</p>
            <p className={styles.statNote}>Awaiting approval</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <h3>Approved</h3>
            <p className={styles.statValue}>
              {approvedFinanceCount + approvedRegistrationCount}
            </p>
            <p className={styles.statNote}>Total approved</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3>Total</h3>
            <p className={styles.statValue}>
              {financeData.length + registrationData.length}
            </p>
            <p className={styles.statNote}>All submissions</p>
          </div>
        </div>
      </div>

      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'finance' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          💰 Finance ({pendingFinanceCount})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'registration' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('registration')}
        >
          📝 Registration ({pendingRegistrationCount})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'finance' && (
          <div className={styles.financeSection}>
            <h2>Financial Submissions</h2>
            {financeData.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💰</div>
                <h3>No Financial Submissions</h3>
                <p>All financial submissions have been processed.</p>
              </div>
            ) : (
              <div className={styles.submissionsGrid}>
  {financeData.map((submission) => (
    <div key={submission.submissionId || submission.id} className={styles.submissionCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.studentInfo}>
                        <h3>{submission.studentName}</h3>
                        <p>ID: {submission.studentId}</p>
                      </div>
                      <div className={styles.submissionMeta}>
                        <span className={styles.submissionDate}>
                          {formatDate(submission.submittedAt)}
                        </span>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.paymentDetails}>
                      <div className={styles.detailRow}>
                        <span>Payment Description:</span>
                        <strong>{submission.paymentDescription}</strong>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Amount:</span>
                        <span className={styles.amount}>{formatCurrency(submission.amount)}</span>
                      </div>
                      {submission.paymentMethod && (
                        <div className={styles.detailRow}>
                          <span>Payment Method:</span>
                          <span>{submission.paymentMethod}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.reviewButton}
                        onClick={() => handleReview(submission)}
                        disabled={submission.status !== 'pending'} // ✅ Disable button for non-pending submissions
                      >
                        {submission.status === 'pending' ? 'Review Payment' : 
                         submission.status === 'approved' ? '✅ Approved' : 
                         submission.status === 'declined' ? '❌ Declined' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'registration' && (
          <div className={styles.registrationSection}>
            <h2>Registration Submissions</h2>
            
            {renderRegistrationStatistics()}

            {renderFilters()}

             <div className={styles.resultsInfo}>
        <p>Showing {filteredRegistrationData.length} of {registrationData.length} submissions</p>
      </div>

            
           {filteredRegistrationData.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3>No Registration Submissions Found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className={styles.registrationsGrid}>
          {filteredRegistrationData.map((submission) => (
                  <div key={submission.id} className={styles.registrationCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.studentInfo}>
                        <h3>{submission.FullName}</h3>
                        <p>Email: {submission.Email}</p>
                        <p>Course: {submission.Course}</p>
                      </div>
                      <div className={styles.submissionMeta}>
                        <span className={styles.submissionDate}>
                          {formatDate(submission.submittedAt)}
                        </span>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: REGISTRATION_STATUS_COLORS[submission.status] }}
                        >
                          {REGISTRATION_STATUS_LABELS[submission.status]}
                        </span>
                      </div>
                    </div>

                    <div className={styles.registrationDetails}>
                      <div className={styles.detailRow}>
                        <span>Phone:</span>
                        <span>{submission.PhoneNumber}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Grade:</span>
                        <span>{submission.Grade}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Country:</span>
                        <span>{submission.Country}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span>Guardian:</span>
                        <span>{submission.Guardian} ({submission.GuardianPhoneNumber})</span>
                      </div>
                      {submission.studentId && (
                        <div className={styles.detailRow}>
                          <span>Student ID:</span>
                          <span className={styles.studentId}>{submission.studentId}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.reviewButton}
                        onClick={() => handleRegistrationReview(submission)}
                      >
                        {submission.status === REGISTRATION_STATUSES.PENDING ? 'Review' : 'View Details'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {selectedSubmission.status === 'approved' ? '✅ Approved Payment' : 
                 selectedSubmission.status === 'declined' ? '❌ Declined Payment' : 
                 'Review Payment Submission'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowReviewModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.reviewSection}>
                <h3>Student Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Student Name:</label>
                    <span>{selectedSubmission.studentName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Student ID:</label>
                    <span>{selectedSubmission.studentId}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Submitted:</label>
                    <span>{formatDate(selectedSubmission.submittedAt)}</span>
                  </div>
                  {selectedSubmission.reviewedAt && (
                    <div className={styles.infoItem}>
                      <label>Reviewed:</label>
                      <span>{formatDate(selectedSubmission.reviewedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h3>Payment Details</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Description:</label>
                    <span>{selectedSubmission.paymentDescription}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Amount:</label>
                    <span className={styles.amount}>{formatCurrency(selectedSubmission.amount)}</span>
                  </div>
                  {selectedSubmission.paymentMethod && (
                    <div className={styles.infoItem}>
                      <label>Payment Method:</label>
                      <span>{selectedSubmission.paymentMethod}</span>
                    </div>
                  )}
                  {selectedSubmission.transactionId && (
                    <div className={styles.infoItem}>
                      <label>Transaction ID:</label>
                      <span>{selectedSubmission.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedSubmission.notes && (
                <div className={styles.reviewSection}>
                  <h3>Student Notes</h3>
                  <p>{selectedSubmission.notes}</p>
                </div>
              )}

              {selectedSubmission.receiptFile && (
                <div className={styles.reviewSection}>
                  <h3>Uploaded Receipt</h3>
                  <div className={styles.receiptPreviewLarge}>
                    <img 
                      src={`http://localhost:5000${selectedSubmission.receiptFile}`} 
                      alt="Payment receipt" 
                    />
                  </div>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3>Admin Notes</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the student (optional)"
                  rows="3"
                  className={styles.notesTextarea}
                  disabled={selectedSubmission.status !== 'pending'} // ✅ Disable for non-pending submissions
                />
                {selectedSubmission.adminNotes && (
                  <div className={styles.previousNotes}>
                    <strong>Previous Admin Notes:</strong>
                    <p>{selectedSubmission.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalActions}>
              {/* ✅ UPDATED: Show appropriate buttons based on status */}
              {selectedSubmission.status === 'pending' && (
                <>
                  <button
                    className={styles.declineButton}
                    onClick={handleDecline}
                  >
                    ❌ Decline
                  </button>
                  <button
                    className={styles.approveButton}
                    onClick={handleApprove}
                  >
                    ✅ Approve
                  </button>
                </>
              )}
              
              {/* Show only close button for approved/declined submissions */}
              {(selectedSubmission.status === 'approved' || selectedSubmission.status === 'declined') && (
                <button
                  className={styles.closeButton}
                  onClick={() => setShowReviewModal(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Review Modal */}
      {showRegistrationModal && selectedRegistration && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Review Registration Submission</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowRegistrationModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.reviewSection}>
                <h3>Student Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Full Name:</label>
                    <span>{selectedRegistration.FullName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Email:</label>
                    <span>{selectedRegistration.Email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Phone:</label>
                    <span>{selectedRegistration.PhoneNumber}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Date of Birth:</label>
                    <span>{selectedRegistration.DOfB}</span>
                  </div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h3>Academic Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Course:</label>
                    <span>{selectedRegistration.Course}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Grade Level:</label>
                    <span>{selectedRegistration.Grade}</span>
                  </div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h3>Personal Details</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Country:</label>
                    <span>{selectedRegistration.Country}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>State of Origin:</label>
                    <span>{selectedRegistration.StateOfOrigin}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Address:</label>
                    <span>{selectedRegistration.Address}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Gender:</label>
                    <span>{selectedRegistration.Gender}</span>
                  </div>
                </div>
              </div>

              <div className={styles.reviewSection}>
                <h3>Guardian Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Guardian Name:</label>
                    <span>{selectedRegistration.Guardian}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Guardian Phone:</label>
                    <span>{selectedRegistration.GuardianPhoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Passport Photo Section */}
              {selectedRegistration.passportPhoto && (
                <div className={styles.reviewSection}>
                  <h3>Passport Photo</h3>
                  <div className={styles.passportPreview}>
                    <img 
                      src={`http://localhost:5000${selectedRegistration.passportPhoto}`} 
                      alt="Passport" 
                    />
                    <div className={styles.passportActions}>
                      <button 
                        type="button"
                        onClick={() => window.open(`http://localhost:5000${selectedRegistration.passportPhoto}`, '_blank')}
                        className={styles.viewFullButton}
                      >
                        View Full Size
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3>Admin Notes</h3>
                <textarea
                  value={registrationAdminNotes}
                  onChange={(e) => setRegistrationAdminNotes(e.target.value)}
                  placeholder="Add notes for the applicant (required for rejection)"
                  rows="3"
                  className={styles.notesTextarea}
                  disabled={selectedRegistration.status === REGISTRATION_STATUSES.APPROVED}
                />
              </div>
            </div>

           <div className={styles.modalActions}>
  {/* PENDING: Show all options */}
  {selectedRegistration.status === REGISTRATION_STATUSES.PENDING && (
    <>
      <button
        className={styles.reviewButton}
        onClick={() => handleRegistrationStatusUpdate(REGISTRATION_STATUSES.UNDER_REVIEW)}
      >
        🔍 Under Review
      </button>
      
      <button
        className={styles.declineButton}
        onClick={() => handleRegistrationStatusUpdate(REGISTRATION_STATUSES.REJECTED)}
        disabled={!registrationAdminNotes.trim()}
      >
        ❌ Reject
      </button>
      
      <button
        className={styles.approveButton}
        onClick={() => handleRegistrationStatusUpdate(REGISTRATION_STATUSES.APPROVED)}
      >
        ✅ Approve
      </button>
    </>
  )}

  {/* UNDER REVIEW: Show only final decision buttons */}
  {selectedRegistration.status === REGISTRATION_STATUSES.UNDER_REVIEW && (
    <>
      <button
        className={styles.declineButton}
        onClick={() => handleRegistrationStatusUpdate(REGISTRATION_STATUSES.REJECTED)}
        disabled={!registrationAdminNotes.trim()}
      >
        ❌ Final Reject
      </button>
      
      <button
        className={styles.approveButton}
        onClick={() => handleRegistrationStatusUpdate(REGISTRATION_STATUSES.APPROVED)}
      >
        ✅ Final Approve
      </button>
    </>
  )}

  {/* APPROVED/REJECTED: Show only close button */}
  {(selectedRegistration.status === REGISTRATION_STATUSES.APPROVED || 
    selectedRegistration.status === REGISTRATION_STATUSES.REJECTED) && (
    <button
      className={styles.closeButton}
      onClick={() => setShowRegistrationModal(false)}
    >
      Close
    </button>
  )}
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotification;