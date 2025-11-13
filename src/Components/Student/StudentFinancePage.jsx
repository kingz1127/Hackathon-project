import React, { useEffect, useState } from 'react';
import styles from './StudentFinancePage.module.css';

const StudentFinancePage = () => {
  const [studentData, setStudentData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    transactionId: '',
    receiptFile: null,
    receiptPreview: null,
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [fileUploadError, setFileUploadError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // New state variables for enhanced receipts
  const [receipts, setReceipts] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptFilters, setReceiptFilters] = useState({
    period: 'all',
    search: ''
  });

  useEffect(() => {
    fetchStudentData();
    fetchPaymentDetails();
    fetchStudentReceipts();
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
        
        // Receipts
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

  
// // ✅ CLEAN VERSION: Sync receipts when admin sends them - SINGLE FUNCTION
// const syncStudentReceipts = async () => {
//   try {
//     const studentId = localStorage.getItem("studentId");
//     console.log('🔄 Syncing student receipts...');
    
//     const response = await fetch(
//       `http://localhost:5000/api/finance/student/${studentId}/sync-receipts`,
//       { 
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       }
//     );
    
//     if (response.ok) {
//       const result = await response.json();
//       console.log('✅ Receipts synced:', result);
      
//       // Refresh the receipts list
//       fetchStudentReceipts();
      
//       return result;
//     } else {
//       console.log('⚠️ Sync failed, refreshing normally');
//       fetchStudentReceipts();
//     }
//   } catch (err) {
//     console.error('Sync error:', err);
//     // Fallback to normal refresh
//     fetchStudentReceipts();
//   }
// };
// ✅ ENHANCED SYNC FUNCTION
const syncStudentReceipts = async () => {
  try {
    const studentId = localStorage.getItem("studentId");
    console.log('🔄 Force syncing student receipts...');
    
    const response = await fetch(
      `http://localhost:5000/api/finance/student/${studentId}/sync-receipts`,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('📡 Sync response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync completed:', result);
      
      if (result.success && result.data?.receipts) {
        console.log(`✅ Sync found ${result.data.receipts.length} receipts`);
        setReceipts(result.data.receipts);
        setStudentData(prev => ({
          ...prev,
          receipts: result.data.receipts
        }));
      } else {
        // If sync doesn't return receipts, try normal fetch
        console.log('🔄 Sync successful but no receipts returned, fetching normally...');
        fetchStudentReceipts();
      }
      
      return result;
    } else {
      console.log('⚠️ Sync failed with status:', response.status);
      // Fallback to normal refresh
      fetchStudentReceipts();
    }
  } catch (err) {
    console.error('❌ Sync error:', err);
    // Fallback to normal refresh
    fetchStudentReceipts();
  }
};

//new guy 5

// ✅ CLEAN VERSION: Generate receipts from payment data - SINGLE FUNCTION
const generateReceiptsFromPayments = async (studentId) => {
  try {
    const paymentsResponse = await fetch(
      `http://localhost:5000/api/finance/student/${studentId}/payments`
    );
    
    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json();
      const payments = paymentsData.payments || [];
      
      // Create receipts from completed payments
      const generatedReceipts = payments
        .filter(payment => payment.amountPaid > 0)
        .map(payment => ({
          id: payment._id || payment.id,
          receiptNumber: `RCP-${(payment._id || payment.id).toString().slice(-8).toUpperCase()}`,
          student: payment.studentName || 'Student',
          studentId: payment.studentId,
          description: payment.description,
          date: payment.updatedAt || payment.createdAt || new Date(),
          total: payment.amountPaid,
          status: 'completed',
          paymentMethod: 'Payment',
          items: [{
            description: payment.description,
            amount: payment.amountPaid
          }],
          subtotal: payment.amountPaid,
          tax: 0,
          balanceInfo: {
            totalDue: payment.amount,
            totalPaid: payment.amountPaid,
            balanceRemaining: Math.max(0, payment.amount - payment.amountPaid)
          }
        }));
      
      console.log('🔄 Generated receipts from payments:', generatedReceipts);
      return generatedReceipts;
    }
  } catch (err) {
    console.error('Error generating receipts from payments:', err);
  }
  
  return [];
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

  // Handle Pay Now button click
  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amountRemaining || payment.amount - (payment.amountPaid || 0),
      paymentMethod: 'bank_transfer',
      transactionId: '',
      receiptFile: null,
      receiptPreview: null,
      notes: ''
    });
    setFileUploadError('');
    setFormErrors({});
    setShowPaymentModal(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFileUploadError('');
    
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setFileUploadError('Please upload a valid file (JPEG, PNG, JPG, or PDF)');
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFileUploadError('File size must be less than 5MB');
        return;
      }

      setPaymentForm(prev => ({
        ...prev,
        receiptFile: file
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPaymentForm(prev => ({
            ...prev,
            receiptPreview: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF files, clear any existing preview
        setPaymentForm(prev => ({
          ...prev,
          receiptPreview: null
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!paymentForm.receiptFile) {
      errors.receiptFile = 'Please upload a receipt';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment submission
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    
    if (!selectedPayment) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      
      // Use the correct payment ID field
      const paymentId = selectedPayment._id || selectedPayment.id || selectedPayment.paymentId;
      console.log('Payment ID being sent:', paymentId);
      console.log('Selected payment object:', selectedPayment);
      
      if (!paymentId) {
        alert('Error: Could not find payment ID. Please try again.');
        return;
      }

      formData.append('paymentId', paymentId);
      formData.append('studentId', localStorage.getItem("studentId"));
      formData.append('amount', paymentForm.amount);
      formData.append('paymentMethod', paymentForm.paymentMethod);
      formData.append('transactionId', paymentForm.transactionId || '');
      formData.append('notes', selectedPayment.description || 'Payment submission');
      
      if (paymentForm.receiptFile) {
        formData.append('receipt', paymentForm.receiptFile);
      }

      console.log('Submitting payment with details:', {
        paymentId: paymentId,
        studentId: localStorage.getItem("studentId"),
        amount: paymentForm.amount,
        description: selectedPayment.description
      });

      const response = await fetch('http://localhost:5000/api/payment-submissions/submit-payment', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Submission result:', result);
      
      if (result.success) {
        alert('Payment submitted successfully! It will be reviewed by the finance department.');
        
        // Reset form and close modal
        setShowPaymentModal(false);
        setSelectedPayment(null);
        setPaymentForm({
          amount: '',
          paymentMethod: 'bank_transfer',
          transactionId: '',
          receiptFile: null,
          receiptPreview: null,
          notes: ''
        });
        setFileUploadError('');
        setFormErrors({});

        // Refresh data
        fetchStudentData(); 
        fetchPaymentDetails();
        fetchStudentReceipts(); // Refresh receipts too
      } else {
        throw new Error(result.message || 'Failed to submit payment');
      }

    } catch (err) {
      console.error('Error submitting payment:', err);
      
      // Show user-friendly error message
      if (err.message.includes('timed out') || err.message.includes('connection')) {
        alert('Database connection issue. Please try again in a moment.');
      } else {
        alert(`Failed to submit payment. Please try again. Error: ${err.message}`);
      }
    } finally {
      setUploading(false);
    }
  };



const fetchStudentReceipts = async () => {
  try {
    setReceiptsLoading(true);
    const studentId = localStorage.getItem("studentId");
    console.log('🔍 Fetching receipts for student:', studentId);
    
    // ✅ METHOD 1: Try the dedicated student receipts endpoint first
    try {
      console.log('🔄 Trying student receipts endpoint...');
      const response = await fetch(
        `http://localhost:5000/api/finance/student/${studentId}/receipts`
      );
      
      console.log('📡 Student receipts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 Received student receipts data:', data);
        
        if (data.success && data.receipts && data.receipts.length > 0) {
          console.log(`✅ Found ${data.receipts.length} receipts via student endpoint`);
          setReceipts(data.receipts);
          setStudentData(prev => ({
            ...prev,
            receipts: data.receipts
          }));
          return;
        } else {
          console.log('❌ No receipts found via student endpoint:', data);
        }
      } else {
        console.log('❌ Student receipts endpoint failed with status:', response.status);
      }
    } catch (err) {
      console.log('⚠️ Student receipts endpoint error:', err.message);
    }
    
    // ✅ METHOD 2: Try admin receipts endpoint with student filter
    try {
      console.log('🔄 Trying admin receipts endpoint...');
      const adminResponse = await fetch(
        `http://localhost:5000/api/finance/admin/receipts?search=${studentId}`
      );
      
      console.log('📡 Admin receipts response status:', adminResponse.status);
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('📄 Received admin receipts data:', adminData);
        
        if (adminData.success && adminData.receipts) {
          // Filter receipts for this specific student
          const studentReceipts = adminData.receipts.filter(receipt => 
            receipt.studentId === studentId
          );
          console.log(`✅ Found ${studentReceipts.length} receipts via admin endpoint`);
          
          if (studentReceipts.length > 0) {
            setReceipts(studentReceipts);
            setStudentData(prev => ({
              ...prev,
              receipts: studentReceipts
            }));
            return;
          }
        }
      }
    } catch (adminErr) {
      console.log('⚠️ Admin receipts endpoint error:', adminErr.message);
    }
    
    // ✅ METHOD 3: Check if receipts exist in database directly
    try {
      console.log('🔄 Checking receipts in database directly...');
      const directResponse = await fetch(
        `http://localhost:5000/api/finance/admin/receipts`
      );
      
      if (directResponse.ok) {
        const allReceipts = await directResponse.json();
        console.log('📄 All receipts in database:', allReceipts);
        
        if (allReceipts.success && allReceipts.receipts) {
          const studentReceipts = allReceipts.receipts.filter(receipt => 
            receipt.studentId === studentId
          );
          console.log(`📊 Found ${studentReceipts.length} receipts for student in entire database`);
          
          if (studentReceipts.length > 0) {
            setReceipts(studentReceipts);
            setStudentData(prev => ({
              ...prev,
              receipts: studentReceipts
            }));
            return;
          }
        }
      }
    } catch (directErr) {
      console.log('⚠️ Direct database check error:', directErr.message);
    }
    
    // ✅ METHOD 4: Final fallback - Generate from payments
    console.log('🔄 No receipts found, generating from payments...');
    const generatedReceipts = await generateReceiptsFromPayments(studentId);
    console.log(`🔄 Generated ${generatedReceipts.length} receipts from payments`);
    
    setReceipts(generatedReceipts);
    setStudentData(prev => ({
      ...prev,
      receipts: generatedReceipts
    }));
    
  } catch (err) {
    console.error('❌ Error fetching student receipts:', err);
    setReceipts([]);
  } finally {
    setReceiptsLoading(false);
  }
};
// new guy 3

  // Download receipt function
  const downloadReceipt = (receipt) => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .receipt { border: 2px solid #333; padding: 20px; max-width: 600px; }
          .header { text-align: center; border-bottom: 1px solid #333; padding-bottom: 10px; }
          .info-section { margin: 15px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .total-row { border-top: 1px solid #333; padding-top: 10px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>PAYMENT RECEIPT</h1>
            <p>Receipt #: ${receipt.receiptNumber || receipt.id}</p>
          </div>
          <div class="info-section">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${receipt.studentName || studentData?.studentInfo?.name}</p>
            <p><strong>Student ID:</strong> ${receipt.studentId || studentData?.studentInfo?.id}</p>
          </div>
          <div class="info-section">
            <h3>Payment Details</h3>
            <p><strong>Date:</strong> ${formatDate(receipt.date)}</p>
            <p><strong>Description:</strong> ${receipt.description}</p>
            <p><strong>Amount:</strong> ${formatCurrency(receipt.total)}</p>
            <p><strong>Status:</strong> ${receipt.status}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt.receiptNumber || receipt.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

const ReceiptsTabContent = () => {
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const studentId = localStorage.getItem("studentId");
      
      const syncResponse = await fetch(
        `http://localhost:5000/api/finance/student/${studentId}/sync-receipts`,
        { method: 'POST' }
      );
      
      if (syncResponse.ok) {
        const result = await syncResponse.json();
        console.log('✅ Sync result:', result);
        alert('Receipts synchronized successfully!');
      } else {
        alert('Sync failed. Please try again.');
      }
    } catch (err) {
      console.error('Sync error:', err);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
      fetchStudentReceipts();
    }
  };

  return (
    <div className={styles.receiptsContent}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>My Receipts</h2>
        <div className={styles.receiptFilters}>
          <select 
            value={receiptFilters.period}
            onChange={(e) => setReceiptFilters(prev => ({ ...prev, period: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <input
            type="text"
            placeholder="Search receipts..."
            value={receiptFilters.search}
            onChange={(e) => setReceiptFilters(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
          <button 
            onClick={handleManualSync}
            className={styles.syncButton}
            disabled={syncing || receiptsLoading}
          >
            {syncing ? '🔄' : '🔄'} {syncing ? 'Syncing...' : 'Sync Receipts'}
          </button>
          <button 
            onClick={fetchStudentReceipts}
            className={styles.refreshButton}
            disabled={receiptsLoading}
          >
            {receiptsLoading ? '🔄' : '🔃'} Refresh
          </button>
        </div>
      </div>

      {receiptsLoading ? (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading receipts...</p>
        </div>
      ) : receipts.length > 0 ? (
        <>
          <div className={styles.receiptsSummary}>
            <div className={styles.summaryItem}>
              <span>Total Receipts:</span>
              <strong>{receipts.length}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount:</span>
              <strong>{formatCurrency(receipts.reduce((sum, receipt) => sum + (receipt.total || 0), 0))}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Last Receipt:</span>
              <strong>{formatDate(receipts[0]?.date)}</strong>
            </div>
          </div>

          <div className={styles.receiptsGrid}>
            {receipts
              .filter(receipt => {
                if (receiptFilters.search) {
                  const searchTerm = receiptFilters.search.toLowerCase();
                  return (
                    receipt.description?.toLowerCase().includes(searchTerm) ||
                    receipt.receiptNumber?.toLowerCase().includes(searchTerm) ||
                    receipt.paymentMethod?.toLowerCase().includes(searchTerm)
                  );
                }
                return true;
              })
              .filter(receipt => {
                if (receiptFilters.period === 'all') return true;
                
                const receiptDate = new Date(receipt.date);
                const now = new Date();
                
                switch (receiptFilters.period) {
                  case 'month':
                    return receiptDate.getMonth() === now.getMonth() && 
                           receiptDate.getFullYear() === now.getFullYear();
                  case 'quarter':
                    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                    return receiptDate >= quarterStart;
                  case 'year':
                    return receiptDate.getFullYear() === now.getFullYear();
                  default:
                    return true;
                }
              })
              .map((receipt, index) => (
                <div key={receipt.id || index} className={styles.receiptCard}>
                  <div className={styles.receiptCardHeader}>
                    <h4>{receipt.description || 'Payment Receipt'}</h4>
                    <span className={getStatusBadgeClass(receipt.status)}>
                      {receipt.status}
                    </span>
                  </div>
                  
                  <div className={styles.receiptCardDetails}>
                    <div className={styles.detailItem}>
                      <span>Receipt #:</span>
                      <span>{receipt.receiptNumber || `RCP-${receipt.id?.slice(-8)}`}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Date:</span>
                      <span>{formatDate(receipt.date)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Amount:</span>
                      <span className={styles.amount}>{formatCurrency(receipt.total)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Method:</span>
                      <span>{receipt.paymentMethod || 'Online'}</span>
                    </div>
                  </div>

                  <div className={styles.receiptCardActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      👁️ View Receipt
                    </button>
                    <button 
                      className={styles.downloadButton}
                      onClick={() => downloadReceipt(receipt)}
                    >
                      📥 Download
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className={styles.noReceipts}>
          <div className={styles.noReceiptsIcon}>🧾</div>
          <h3>No Receipts Found</h3>
          <p>You don't have any receipts yet. This could be because:</p>
          <ul className={styles.troubleshootingList}>
            <li>• No payments have been processed yet</li>
            <li>• Receipts haven't been sent to you</li>
            <li>• There's a sync issue with the system</li>
          </ul>
          <div className={styles.actionButtons}>
            <button onClick={fetchStudentReceipts} className={styles.retryButton}>
              Check Again
            </button>
            <button onClick={handleManualSync} className={styles.syncButton}>
              Sync Receipts
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

  // Payment Modal Component
  const PaymentModal = ({ isOpen, onClose, payment, student }) => {
    if (!isOpen || !payment) return null;

    const amountRemaining = payment.amountRemaining || (payment.amount - (payment.amountPaid || 0));

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Submit Payment</h2>
            <button 
              type="button"
              className={styles.closeButton} 
              onClick={onClose}
              disabled={uploading}
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmitPayment} className={styles.paymentForm} noValidate>
            {/* Payment Information */}
            <div className={styles.formSection}>
              <h3>Payment Information</h3>
              <h3>School Account: 6019306025 Keystone</h3>
              <h3>School Account Name: Oshunyingbo Adedeji</h3>
              <div className={styles.paymentSummary}>
                <div className={styles.summaryRow}>
                  <span>Payment Description:</span>
                  <strong>{payment.description}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(payment.amount)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Amount Paid:</span>
                  <span style={{ color: '#10b981' }}>{formatCurrency(payment.amountPaid || 0)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Amount Remaining:</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {formatCurrency(amountRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className={styles.formSection}>
              <h3>Payment Details</h3>
              
              <div className={styles.formGroup}>
                <label>Amount to Pay *</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  min="0.01"
                  max={amountRemaining}
                  step="0.01"
                  className={formErrors.amount ? styles.inputError : ''}
                />
                {formErrors.amount && (
                  <span className={styles.errorText}>{formErrors.amount}</span>
                )}
                <small>Maximum: {formatCurrency(amountRemaining)}</small>
              </div>

              <div className={styles.formGroup}>
                <label>Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Transaction ID/Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  placeholder="Enter transaction reference number (if available)"
                />
                <small>Leave blank if not applicable</small>
              </div>

              <div className={styles.formGroup}>
                <label>Additional Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information about this payment..."
                  rows="3"
                />
              </div>
            </div>

            {/* Receipt Upload */}
            <div className={styles.formSection}>
              <h3>Upload Receipt *</h3>
              <div className={styles.fileUploadSection}>
                <div className={`${styles.uploadArea} ${formErrors.receiptFile ? styles.uploadAreaError : ''}`}>
                  <input
                    type="file"
                    id="receiptUpload"
                    onChange={handleFileUpload}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className={styles.fileInput}
                  />
                  <label htmlFor="receiptUpload" className={styles.uploadLabel}>
                    <div className={styles.uploadIcon}>📎</div>
                    <div>
                      <strong>Click to upload receipt</strong>
                      <p>Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                    </div>
                  </label>
                </div>

                {fileUploadError && (
                  <div className={styles.fileUploadError}>
                    {fileUploadError}
                  </div>
                )}

                {formErrors.receiptFile && (
                  <div className={styles.fileUploadError}>
                    {formErrors.receiptFile}
                  </div>
                )}

                {paymentForm.receiptFile && (
                  <div className={styles.filePreview}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{paymentForm.receiptFile.name}</span>
                      <span className={styles.fileSize}>
                        {(paymentForm.receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentForm(prev => ({
                            ...prev,
                            receiptFile: null,
                            receiptPreview: null
                          }));
                          setFileUploadError('');
                          setFormErrors(prev => ({
                            ...prev,
                            receiptFile: ''
                          }));
                        }}
                        className={styles.removeFile}
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                    
                    {paymentForm.receiptPreview && (
                      <div className={styles.imagePreview}>
                        <img src={paymentForm.receiptPreview} alt="Receipt preview" />
                      </div>
                    )}
                    
                    {paymentForm.receiptFile.type === 'application/pdf' && (
                      <div className={styles.pdfPreview}>
                        <div className={styles.pdfIcon}>📄</div>
                        <span>PDF Document</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={uploading}
              >
                {uploading ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Enhanced Receipt Modal Component
  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    // Enhanced receipt data handling
    const receiptItems = receipt.items || [{ 
      description: receipt.description || 'Payment', 
      amount: receipt.total || 0 
    }];
    
    const subtotal = receipt.subtotal || receipt.total || 
                    receiptItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const tax = receipt.tax || 0;
    const total = receipt.total || subtotal + tax;
    
    const balanceInfo = receipt.balanceInfo || {
      totalDue: subtotal,
      totalPaid: total,
      balanceRemaining: Math.max(0, subtotal - total)
    };

    // Student information with better fallbacks
    const studentName = receipt.student || receipt.studentName || studentData?.studentInfo?.name || 'Student';
    const studentId = receipt.studentId || studentData?.studentInfo?.id || 'N/A';
    const studentEmail = receipt.studentEmail || studentData?.studentInfo?.email || 'N/A';
    const studentCourse = receipt.studentCourse || studentData?.studentInfo?.course || 'N/A';

    // Date handling
    const receiptDate = receipt.date ? new Date(receipt.date) : new Date();
    const formattedDate = formatDate(receiptDate);
    const formattedTime = receipt.time || receiptDate.toLocaleTimeString();

    const handlePrint = () => {
      const receiptContent = document.getElementById("student-receipt-content");
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = receiptContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    };

    const handleDownload = () => {
      downloadReceipt(receipt);
    };

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Payment Receipt</h2>
            <div className={styles.modalActions}>
              <button className={styles.downloadButton} onClick={handleDownload}>
                📥 Download
              </button>
              <button className={styles.printButton} onClick={handlePrint}>
                🖨️ Print
              </button>
              <button className={styles.closeButton} onClick={onClose}>
                ×
              </button>
            </div>
          </div>

          <div className={styles.receiptContainer}>
            <div id="student-receipt-content" className={styles.receipt}>
              <div className={styles.receiptHeader}>
                <div className={styles.receiptLogo}>
                  <div className={styles.logoIcon}>🏫</div>
                  <div>
                    <h3>School Finance System</h3>
                    <p>Official Payment Receipt</p>
                  </div>
                </div>
                <div className={styles.receiptTitle}>
                  <h1>PAYMENT RECEIPT</h1>
                  <p className={styles.receiptId}>
                    {receipt.receiptNumber || `RCP-${receipt.id}`}
                  </p>
                </div>
              </div>

              <div className={styles.receiptInfo}>
                <div className={styles.infoSection}>
                  <h4>Student Information</h4>
                  <p><strong>Name:</strong> {studentName}</p>
                  <p><strong>Student ID:</strong> {studentId}</p>
                  <p><strong>Email:</strong> {studentEmail}</p>
                  <p><strong>Course:</strong> {studentCourse}</p>
                </div>
                <div className={styles.infoSection}>
                  <h4>Transaction Details</h4>
                  <p><strong>Date:</strong> {formattedDate}</p>
                  <p><strong>Time:</strong> {formattedTime}</p>
                  <p><strong>Transaction ID:</strong> {receipt.transactionId || receipt.id || 'N/A'}</p>
                  <p><strong>Payment Method:</strong> {receipt.paymentMethod || 'Online'}</p>
                </div>
              </div>

              <div className={styles.receiptItems}>
                <h4>Payment Details</h4>
                <div className={styles.itemsHeader}>
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                {receiptItems.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <span>{item.description || 'Payment'}</span>
                    <span className={styles.debit}>
                      {formatCurrency(item.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.receiptTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>{formatCurrency(total)}</strong></span>
                </div>
              </div>

              <div className={styles.balanceSection}>
                <h4>Account Summary</h4>
                <div className={styles.balanceRow}>
                  <span>Total Due:</span>
                  <span>{formatCurrency(balanceInfo.totalDue)}</span>
                </div>
                <div className={styles.balanceRow}>
                  <span>Total Paid:</span>
                  <span style={{ color: '#10b981' }}>{formatCurrency(balanceInfo.totalPaid)}</span>
                </div>
                <div className={styles.balanceRow}>
                  <span><strong>Balance Remaining:</strong></span>
                  <span style={{ 
                    color: balanceInfo.balanceRemaining > 0 ? '#ef4444' : '#10b981',
                    fontWeight: 'bold'
                  }}>
                    {formatCurrency(balanceInfo.balanceRemaining)}
                  </span>
                </div>
              </div>

              <div className={styles.receiptFooter}>
                <div className={styles.paymentMethod}>
                  <p><strong>Payment Method:</strong> {receipt.paymentMethod || 'Online'}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>
                      {receipt.status || 'Completed'}
                    </span>
                  </p>
                </div>
                <div className={styles.receiptStamp}>
                  <div className={styles.stamp}>
                    PAID
                  </div>
                </div>
              </div>

              <div className={styles.receiptNote}>
                <p>This is an official receipt. Please retain for your records.</p>
                <p>For any inquiries, contact the Finance Office at finance@university.edu</p>
              </div>
            </div>
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

      {/* Quick Stats */}
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

      {/* Tab Content */}
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
                      <button 
                        className={styles.payButton}
                        onClick={() => handlePayNow(payment)}
                      >
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

        {activeTab === 'transactions' && (
          <div className={styles.transactionsContent}>
            <h2 className={styles.sectionTitle}>Transaction History</h2>
            <div className={styles.transactionsList}>
              {studentData.recentTransactions && studentData.recentTransactions.length > 0 ? (
                studentData.recentTransactions.map((transaction, index) => (
                  <div key={index} className={styles.transactionItem}>
                    <div className={styles.transactionInfo}>
                      <h4>{transaction.description}</h4>
                      <p>{formatDate(transaction.date)}</p>
                    </div>
                    <div className={`${styles.transactionAmount} ${
                      transaction.amount > 0 ? styles.credit : styles.debit
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={getStatusBadgeClass(transaction.status)}>
                      {transaction.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noTransactions}>
                  <p>No transactions found.</p>
                  <p>Transaction history will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'receipts' && <ReceiptsTabContent />}
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPayment(null);
          setFileUploadError('');
        }}
        payment={selectedPayment}
        student={studentData.studentInfo}
      />

      {/* Receipt Modal */}
      <ReceiptModal 
        receipt={selectedReceipt} 
        onClose={() => setSelectedReceipt(null)} 
      />
    </div>
  );
};

export default StudentFinancePage;