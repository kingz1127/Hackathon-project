

// export default StudentFinancePage;
import React, { useEffect, useState } from 'react';
import styles from './StudentFinancePage.module.css';

const StudentFinancePage = () => {
  const [studentData, setStudentData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchStudentData();
    fetchPaymentDetails();
  }, []);

  const fetchStudentData = async () => {
  try {
    setLoading(true);
    const studentId = localStorage.getItem("studentId");
    const url = `http://localhost:5000/api/finance/student/${studentId}/overview`;
    console.log("Fetching student data from:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log("Raw student data:", rawData);

    // Transform the data to match your frontend structure
    const transformedData = {
      // Student info
      studentInfo: rawData.studentInfo || {
        name: "Student",
        id: studentId,
        email: "",
        course: "",
        gradeLevel: ""
      },
      
      // Financial summary (using the new structure)
      financialSummary: rawData.financialSummary || {
        totalDue: 0,
        amountPaid: 0,
        amountRemaining: 0,
        accountBalance: 0,
        paymentProgress: 0
      },
      
      // Map to old structure for compatibility
      outstandingBalance: rawData.financialSummary?.amountRemaining || 0,
      pendingPayments: rawData.financialSummary?.amountRemaining || 0, // Using remaining as pending
      collectedThisMonth: rawData.financialSummary?.amountPaid || 0,
      collectionRate: rawData.financialSummary?.paymentProgress || 0,
      
      // Payment distribution
      paymentDistribution: rawData.paymentDistribution || [],
      
      // Recent transactions
      recentTransactions: rawData.recentTransactions || [],
      
      // Payment history
      paymentHistory: rawData.paymentHistory || [],
      
      // Upcoming payments
      upcomingPayments: rawData.upcomingPayments || [],
      
      // Payment summary for progress bar
      paymentSummary: {
        totalDue: rawData.financialSummary?.totalDue || 0,
        amountPaid: rawData.financialSummary?.amountPaid || 0,
        remaining: rawData.financialSummary?.amountRemaining || 0,
        status: rawData.financialSummary?.amountRemaining > 0 ? 'Pending' : 'Completed'
      },
      
      // Receipts (you'll need to fetch these separately or add to the backend)
      receipts: rawData.receipts || []
    };

    console.log("Transformed student data:", transformedData);
    setStudentData(transformedData);
  } catch (err) {
    console.error("Error fetching student data:", err);
    setError("Failed to load financial data. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const fetchPaymentDetails = async () => {
  try {
    const studentId = localStorage.getItem("studentId");
    const response = await fetch(`http://localhost:5000/api/finance/student/${studentId}/payments`);
    
    console.log("Payment details response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Payment details:", data);
      
      // Transform payment data to include amountRemaining
      const transformedPayments = data.payments ? data.payments.map(payment => ({
        ...payment,
        amountRemaining: (payment.amount || 0) - (payment.amountPaid || 0)
      })) : [];
      
      setPaymentDetails({
        ...data,
        payments: transformedPayments
      });
    } else {
      console.error("Failed to fetch payment details");
    }
  } catch (err) {
    console.error("Error fetching payment details:", err);
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
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return styles.statusCompleted;
      case 'pending':
        return styles.statusPending;
      case 'overdue':
        return styles.statusOverdue;
      case 'partial':
        return styles.statusPartial;
      case 'due':
        return styles.statusDue;
      default:
        return styles.statusPending;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your financial information...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchStudentData} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className={styles.errorContainer}>
        <h3>No Data Available</h3>
        <p>Unable to load financial data.</p>
        <button onClick={fetchStudentData} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Payment Receipt</h2>
            <button className={styles.closeButton} onClick={onClose}>×</button>
          </div>
          
          <div className={styles.receiptContent}>
            <div className={styles.receiptHeader}>
              <h3>Payment Confirmation</h3>
              <p className={styles.receiptId}>Receipt #: {receipt.id || 'N/A'}</p>
            </div>
            
            <div className={styles.receiptDetails}>
              <div className={styles.detailRow}>
                <span>Student:</span>
                <span>{receipt.student || 'Student'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Student ID:</span>
                <span>{receipt.studentId || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Date:</span>
                <span>{formatDate(receipt.date)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Amount:</span>
                <span className={styles.receiptAmount}>{formatCurrency(receipt.total)}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Status:</span>
                <span className={getStatusBadgeClass(receipt.status)}>{receipt.status || 'Completed'}</span>
              </div>
            </div>

            {receipt.items && receipt.items.length > 0 && (
              <div className={styles.receiptItems}>
                <h4>Items</h4>
                {receipt.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

 return (
  <div className={styles.container}>
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>My Finance Dashboard</h1>
        <p className={styles.subtitle}>
          Welcome back, {studentData.studentInfo?.name || 'Student'}
        </p>
      </div>
    </header>

    {/* Quick Stats - Updated to use new data structure */}
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>💰</div>
        <div className={styles.statContent}>
          <h3>Total Due</h3>
          <p className={styles.statValue}>
            {formatCurrency(studentData.financialSummary?.totalDue || studentData.outstandingBalance)}
          </p>
          <p className={styles.statNote}>Overall amount due</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>⏳</div>
        <div className={styles.statContent}>
          <h3>Amount Paid</h3>
          <p className={styles.statValue} style={{ color: '#10b981' }}>
            {formatCurrency(studentData.financialSummary?.amountPaid || studentData.collectedThisMonth)}
          </p>
          <p className={styles.statNote}>Total paid so far</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>✅</div>
        <div className={styles.statContent}>
          <h3>Remaining Balance</h3>
          <p className={styles.statValue} style={{ 
            color: (studentData.financialSummary?.amountRemaining || studentData.outstandingBalance) > 0 ? '#ef4444' : '#10b981' 
          }}>
            {formatCurrency(studentData.financialSummary?.amountRemaining || studentData.outstandingBalance)}
          </p>
          <p className={styles.statNote}>Outstanding amount</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statContent}>
          <h3>Payment Progress</h3>
          <p className={styles.statValue}>
            {studentData.financialSummary?.paymentProgress || studentData.collectionRate}%
          </p>
          <p className={styles.statNote}>Completion rate</p>
        </div>
      </div>
    </div>


      {/* Tabs */}
     <div className={styles.tabContainer}>
      <button 
        className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('overview')}
      >
        📊 Overview
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'payments' ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('payments')}
      >
        💳 My Payments
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('transactions')}
      >
        📝 Transactions
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'receipts' ? styles.tabActive : ''}`}
        onClick={() => setActiveTab('receipts')}
      >
        🧾 Receipts
      </button>
    </div>

    {/* Tab Content - Update payments tab to use paymentDetails */}
    <div className={styles.tabContent}>
      {activeTab === 'overview' && (
        <div className={styles.overviewContent}>
          {/* Payment Distribution */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fee Distribution</h2>
            <div className={styles.distributionChart}>
              {studentData.paymentDistribution.map((item, index) => (
                <div key={index} className={styles.chartItem}>
                  <div className={styles.chartBar}>
                    <div 
                      className={styles.chartFill}
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  <div className={styles.chartLabel}>
                    <div className={styles.chartColor} style={{ backgroundColor: item.color }}></div>
                    <span className={styles.chartCategory}>{item.category}</span>
                    <span className={styles.chartAmount}>{formatCurrency(item.amount)}</span>
                    <span className={styles.chartPercentage}>{item.percentage}%</span>
                  </div>
                </div>
              ))}
              {studentData.paymentDistribution.length === 0 && (
                <p className={styles.noData}>No payment distribution data available</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className={styles.activityList}>
              {studentData.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {transaction.type === 'payment' ? '↗️' : '↙️'}
                  </div>
                  <div className={styles.activityInfo}>
                    <h4>{transaction.description}</h4>
                    <p>{formatDate(transaction.date)}</p>
                  </div>
                  <div className={`${styles.activityAmount} ${
                    transaction.amount > 0 ? styles.credit : styles.debit
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
              {studentData.recentTransactions.length === 0 && (
                <p className={styles.noData}>No recent transactions</p>
              )}
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Payments</h2>
            <div className={styles.upcomingList}>
              {studentData.upcomingPayments.slice(0, 3).map((payment, index) => (
                <div key={index} className={styles.upcomingItem}>
                  <div className={styles.upcomingInfo}>
                    <h4>{payment.description}</h4>
                    <p>Due: {formatDate(payment.dueDate)}</p>
                  </div>
                  <div className={styles.upcomingAmount}>
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className={getStatusBadgeClass(payment.status)}>
                    {payment.status}
                  </div>
                </div>
              ))}
              {studentData.upcomingPayments.length === 0 && (
                <p className={styles.noData}>No upcoming payments</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className={styles.paymentsContent}>
          <h2 className={styles.sectionTitle}>My Payments</h2>
          <div className={styles.paymentsList}>
            {paymentDetails && paymentDetails.payments && paymentDetails.payments.length > 0 ? (
              paymentDetails.payments.map((payment, index) => (
                <div key={index} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <h4>{payment.description}</h4>
                    <p>Type: {payment.type || 'General'}</p>
                    <p>Due: {formatDate(payment.dueDate)}</p>
                  </div>
                  <div className={styles.paymentAmounts}>
                    <div className={styles.amountRow}>
                      <span>Total:</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                    <div className={styles.amountRow}>
                      <span>Paid:</span>
                      <span style={{ color: '#10b981' }}>{formatCurrency(payment.amountPaid)}</span>
                    </div>
                    <div className={styles.amountRow}>
                      <span>Remaining:</span>
                      <span style={{ 
                        color: (payment.amount - payment.amountPaid) > 0 ? '#ef4444' : '#10b981' 
                      }}>
                        {formatCurrency(payment.amount - payment.amountPaid)}
                      </span>
                    </div>
                  </div>
                  <div className={getStatusBadgeClass(payment.status)}>
                    {payment.status}
                  </div>
                  {(payment.amount - payment.amountPaid) > 0 && (
                    <button className={styles.payButton}>
                      Pay Now
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noPayments}>
                <p>No payments assigned yet.</p>
                <p>Payments will appear here once assigned by the administration.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest of your tab content remains the same... */}
    </div>

    {/* Receipt Modal */}
    <ReceiptModal 
      receipt={selectedReceipt} 
      onClose={() => setSelectedReceipt(null)} 
    />
  </div>
);
};

export default StudentFinancePage;