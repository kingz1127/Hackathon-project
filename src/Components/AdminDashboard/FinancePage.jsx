import React, { useEffect, useState } from "react";
import styles from "./FinancePage.module.css";

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    description: "",
    dueDate: "",
    type: "tuition",
  });

  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [selectedStudentPayments, setSelectedStudentPayments] = useState([]);
  const [sendingReceipt, setSendingReceipt] = useState(null);
  const [sendStatus, setSendStatus] = useState({});

  const [receipts, setReceipts] = useState([]);
  const [receiptFilters, setReceiptFilters] = useState({
    period: 'all',
    search: ''
  });
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  // Add this modal component before your existing modals
  const PaymentsModal = ({ isOpen, onClose, payments, student }) => {
    if (!isOpen || !payments.length) return null;

    const handleEditPayment = (payment) => {
      const totalDue = payment.amount || payment.totalAmount || 0;
      const amountPaid = payment.amountPaid || 0;
      
      setEditingPayment({
        id: payment.id,
        studentId: student.id,
        studentName: student.name,
        description: payment.description || "Payment",
        totalAmount: totalDue,
        amountPaid: amountPaid,
        status: payment.status || "pending",
        dueDate: payment.dueDate || "",
        type: payment.type || "tuition"
      });
      setShowPaymentsModal(false);
      setShowEditModal(true);
    };

    // In your student payment display section, update the status calculation:
const getPaymentStatus = (payment) => {
  const total = payment.amount || payment.totalAmount || 0;
  const paid = payment.amountPaid || 0;
  const remaining = total - paid;
  
  if (paid <= 0) return "Pending"; // ✅ NEW: No payments made
  if (remaining <= 0) return "Completed";
  if (remaining < total) return "Partial";
  return "Pending";
};

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '800px' }}
        >
          <div className={styles.modalHeader}>
            <h2>Select Payment to Edit - {student.name}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <div className={styles.paymentsList} style={{ padding: "20px" }}>
            <div className={styles.paymentsTable}>
              <div className={styles.paymentsHeader}>
                <div className={styles.paymentCell}>Description</div>
                <div className={styles.paymentCell}>Due Date</div>
                <div className={styles.paymentCell}>Total Amount</div>
                <div className={styles.paymentCell}>Amount Paid</div>
                <div className={styles.paymentCell}>Status</div>
                <div className={styles.paymentCell}>Action</div>
              </div>
              
              {payments.map((payment, index) => {
                const status = getPaymentStatus(payment);
                
                return (
                  <div key={payment.id || index} className={styles.paymentRow}>
                    <div className={styles.paymentCell}>
                      <strong>{payment.description || "Payment"}</strong>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Type: {payment.type || "tuition"}
                      </div>
                    </div>
                    <div className={styles.paymentCell}>
                      {payment.dueDate ? formatDate(payment.dueDate) : "Not set"}
                    </div>
                    <div className={styles.paymentCell}>
                      {formatCurrency(payment.amount || payment.totalAmount || 0)}
                    </div>
                    <div className={styles.paymentCell}>
                      {formatCurrency(payment.amountPaid || 0)}
                    </div>
                    <div className={styles.paymentCell}>
                      <span
                        className={`${styles.statusBadge} ${
                          status === "Completed"
                            ? styles.statusCompleted
                            : status === "Partial"
                            ? styles.statusPartial
                            : styles.statusPending
                        }`}
                      >
                        {payment.status || status}
                      </span>
                    </div>
                    <div className={styles.paymentCell}>
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditPayment(payment)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: "0 20px 20px", textAlign: "center" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper functions for analytics charts
  const generateRevenueBars = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentData = [12000, 19000, 15000, 18000, 16000, 19500, 21000, 18500, 22000, 24000, 23000, 25000];
    const previousData = [11000, 17000, 14000, 16000, 15000, 18000, 19000, 17000, 20000, 22000, 21000, 23000];

    return months.map((month, index) => (
      <div key={month} className={styles.barGroup}>
        <div className={styles.bars}>
          <div 
            className={styles.barPrevious} 
            style={{ height: `${(previousData[index] / 30000) * 100}%` }}
          ></div>
          <div 
            className={styles.barCurrent} 
            style={{ height: `${(currentData[index] / 30000) * 100}%` }}
          ></div>
        </div>
        <span className={styles.barLabel}>{month}</span>
      </div>
    ));
  };

  const renderPaymentMethods = () => {
    if (!financialData?.paymentDistribution) return null;
    
    const total = financialData.paymentDistribution.reduce((sum, method) => sum + method.percentage, 0);
    let currentAngle = 0;

    return financialData.paymentDistribution.map((method, index) => {
      const angle = (method.percentage / total) * 360;
      const slice = (
        <div
          key={method.category}
          className={styles.pieSlice}
          style={{
            backgroundColor: method.color,
            transform: `rotate(${currentAngle}deg)`,
            clipPath: `conic-gradient(from 0deg at 50% 50%, ${method.color} 0deg ${angle}deg, transparent ${angle}deg)`
          }}
        ></div>
      );
      currentAngle += angle;
      return slice;
    });
  };

  const renderBalanceTrend = () => {
    if (!financialData?.outstandingBalance) return null;
    
    const data = [45000, 42000, 38000, 35000, 32000, 30000, 28000, 25000, 22000, 20000, 18000, financialData.outstandingBalance];
    const maxValue = Math.max(...data);
    
    return data.map((value, index) => (
      <div key={index} className={styles.linePoint}>
        <div 
          className={styles.lineDot}
          style={{ bottom: `${(value / maxValue) * 100}%` }}
        ></div>
        {index < data.length - 1 && (
          <div 
            className={styles.lineConnector}
            style={{ 
              height: `${Math.abs((data[index + 1] / maxValue) * 100 - (value / maxValue) * 100)}%`,
              bottom: `${(value / maxValue) * 100}%`
            }}
          ></div>
        )}
      </div>
    ));
  };

  const renderPaymentStatus = () => {
    const statusData = [
      { status: 'Completed', value: 65, color: '#10b981' },
      { status: 'Partial', value: 20, color: '#f59e0b' },
      { status: 'Pending', value: 10, color: '#3b82f6' },
      { status: 'Overdue', value: 5, color: '#ef4444' }
    ];

    return (
      <div className={styles.statusBars}>
        {statusData.map((item) => (
          <div key={item.status} className={styles.statusBar}>
            <div className={styles.statusLabel}>{item.status}</div>
            <div className={styles.statusBarContainer}>
              <div 
                className={styles.statusBarFill}
                style={{ 
                  width: `${item.value}%`,
                  backgroundColor: item.color
                }}
              ></div>
            </div>
            <div className={styles.statusValue}>{item.value}%</div>
          </div>
        ))}
      </div>
    );
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'overdue': return styles.statusOverdue;
      case 'due soon': return styles.statusDueSoon;
      default: return styles.statusCurrent;
    }
  };

  const exportAnalyticsData = () => {
    const dataStr = JSON.stringify(financialData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fetchReceipts = async (filters = {}) => {
    try {
      setReceiptsLoading(true);
      
      const params = new URLSearchParams();
      if (filters.period && filters.period !== 'all') {
        params.append('period', filters.period);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const url = `http://localhost:5000/api/finance/admin/receipts?${params.toString()}`;
      console.log('Fetching receipts from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.receipts) {
        setReceipts(data.receipts);
        console.log(`Loaded ${data.receipts.length} receipts`);
      } else {
        console.error('Failed to fetch receipts:', data.message);
        setReceipts([]);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setReceipts([]);
    } finally {
      setReceiptsLoading(false);
    }
  };

  // ✅ FIXED: Working receipt sending with proper error handling
const sendReceiptToStudent = async (receiptId) => {
  try {
    setSendStatus(prev => ({ ...prev, [receiptId]: 'sending' }));
    
    console.log('📤 Sending actual receipt to student:', receiptId);
    
    // Get the current receipt data
    const receiptToSend = selectedReceipt;
    if (!receiptToSend) {
      throw new Error('No receipt data available');
    }

    console.log('📄 Receipt data for sending:', {
      receiptId,
      studentId: receiptToSend.studentId,
      studentName: receiptToSend.student,
      receiptNumber: receiptToSend.receiptNumber
    });

    const response = await fetch(
      `http://localhost:5000/api/finance/admin/receipts/${receiptId}/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: receiptToSend.studentId,
          sendEmail: true
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Send receipt error response:', errorText);
      
      let errorMessage = 'Failed to send receipt';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (result.success) {
      setSendStatus(prev => ({ ...prev, [receiptId]: 'sent' }));
      alert('✅ Receipt sent to student successfully!');
      
      // Refresh receipts to show updated status
      fetchReceipts(receiptFilters);
    } else {
      throw new Error(result.message || 'Failed to send receipt');
    }
  } catch (err) {
    console.error('❌ Error sending receipt:', err);
    setSendStatus(prev => ({ ...prev, [receiptId]: 'error' }));
    
    // Show specific error messages
    if (err.message.includes('Receipt not found')) {
      alert('❌ Receipt not found in database. Please ensure the receipt exists.');
    } else if (err.message.includes('Student not found')) {
      alert('❌ Student not found. Please check student information.');
    } else {
      alert(`Failed to send receipt: ${err.message}`);
    }
      
    // Reset error status after 3 seconds
    setTimeout(() => {
      setSendStatus(prev => ({ ...prev, [receiptId]: '' }));
    }, 3000);
  }
};
//new guy up 2

// ✅ NEW: Simulate receipt sending for demo purposes
const simulateReceiptSending = async (receiptId) => {
  try {
    console.log('🎭 Simulating receipt sending for demo...');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSendStatus(prev => ({ ...prev, [receiptId]: 'sent' }));
    alert('✅ Receipt sent to student successfully! (Demo Mode)');
    
    console.log('📧 Receipt would be sent to:', selectedReceipt?.studentEmail || 'student@school.edu');
    console.log('📄 Receipt details:', {
      receiptNumber: selectedReceipt?.receiptNumber,
      amount: selectedReceipt?.total,
      student: selectedReceipt?.student
    });
    
  } catch (error) {
    console.error('Simulation error:', error);
    setSendStatus(prev => ({ ...prev, [receiptId]: 'error' }));
    alert('Failed to send receipt in demo mode');
  }
};


// ✅ NEW: Helper function to get receipt data for sending
const getReceiptDataForSending = async (receiptId) => {
  try {
    // Try to get receipt from receipts endpoint first
    const receiptResponse = await fetch(
      `http://localhost:5000/api/finance/receipt/${receiptId}`
    );
    
    if (receiptResponse.ok) {
      return await receiptResponse.json();
    }
    
    // Fallback: Get from transactions
    const transactionResponse = await fetch(
      `http://localhost:5000/api/finance/admin/overview`
    );
    
    if (transactionResponse.ok) {
      const financialData = await transactionResponse.json();
      const transaction = financialData.recentTransactions.find(t => 
        t.id === receiptId || t._id === receiptId
      );
      
      if (transaction) {
        return await buildCompleteReceipt(transaction);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting receipt data for sending:', error);
    return null;
  }
};

  useEffect(() => {
    if (activeTab === "receipts") {
      console.log("Receipts tab activated, fetching receipts...");
      fetchReceipts(receiptFilters);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "receipts") {
      const timeoutId = setTimeout(() => {
        fetchReceipts(receiptFilters);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [receiptFilters.period, receiptFilters.search]);

  useEffect(() => {
    fetchFinancialData();
    fetchAllStudents();
  }, [timeRange]);

  // UPDATE your fetchFinancialData function:

// UPDATE your fetchFinancialData function:

const fetchFinancialData = async () => {
  try {
    setLoading(true);
    const url = `http://localhost:5000/api/finance/admin/overview`;
    console.log("Fetching admin financial data from:", url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched admin data:", data);

    // ✅ The backend now provides enhanced transactions with student names from database
    // No need for additional student fetching on frontend
    const transformedTransactions = Array.isArray(data.recentTransactions) 
      ? data.recentTransactions.map(transaction => ({
          id: transaction.id || transaction._id,
          student: transaction.student || 'Student', // ✅ Now uses actual student name from database
          studentId: transaction.studentId || 'N/A',
          description: transaction.description || 'Payment',
          amount: transaction.amount || 0,
          date: transaction.date || new Date(),
          type: transaction.type || 'payment',
          status: transaction.status || 'completed'
        }))
      : [];

    setFinancialData({
      totalRevenue: data.totalRevenue || 0,
      revenueTrend: data.revenueTrend || 0,
      pendingPayments: data.pendingPayments || 0,
      collectedThisMonth: data.collectedThisMonth || 0,
      outstandingBalance: data.outstandingBalance || 0,
      collectionRate: data.collectionRate || 0,
      paymentDistribution: Array.isArray(data.paymentDistribution)
        ? data.paymentDistribution
        : [],
      topStudents: Array.isArray(data.topStudents) ? data.topStudents : [],
      recentTransactions: transformedTransactions,
      receipts: Array.isArray(data.receipts) ? data.receipts : [],
    });
    
    setTransactions(transformedTransactions);
    console.log('✅ Transactions with student names:', transformedTransactions);
  } catch (err) {
    console.error("Error fetching financial data:", err);
    setError("Failed to load financial data.");
  } finally {
    setLoading(false);
  }
};

  const fetchStudentPayments = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/student/${studentId}/payments`
      );
      if (response.ok) {
        const data = await response.json();
        return data.payments || [];
      }
      return [];
    } catch (err) {
      console.error("Error fetching student payments:", err);
      return [];
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/finance/admin/students");
      if (!response.ok) {
        console.log("Admin students endpoint not available");
        return;
      }
      const data = await response.json();

      const studentsWithPayments = await Promise.all(
        data.map(async (student) => {
          const payments = await fetchStudentPayments(student.id);
          const totalAmount = payments.reduce(
            (sum, payment) => sum + (payment.amount || 0),
            0
          );
          const amountPaid = payments.reduce(
            (sum, payment) => sum + (payment.amountPaid || 0),
            0
          );

          return {
            ...student,
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            payments: payments,
          };
        })
      );

      setStudents(studentsWithPayments);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleSetPayment = async (e) => {
    e.preventDefault();
 
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      console.log("Setting payment for student:", selectedStudent);
      console.log("Payment data:", paymentForm);

      const paymentData = {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        amount: parseFloat(paymentForm.amount),
        description: paymentForm.description,
        dueDate: paymentForm.dueDate,
        type: paymentForm.type,
      };

      console.log("Sending payment data to backend:", paymentData);

      const response = await fetch(
        `http://localhost:5000/api/finance/admin/set-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          alert(
            `Failed to set payment: ${errorData.message || "Unknown error"}`
          );
        } catch {
          alert(`Failed to set payment: ${errorText || "Unknown error"}`);
        }

        return;
      }

      const result = await response.json();
      console.log("Payment set successfully:", result);

      alert("Payment successfully set for student!");
      setShowPaymentModal(false);
      setSelectedStudent(null);
      setPaymentForm({
        amount: "",
        description: "",
        dueDate: "",
        type: "tuition",
      });

      fetchFinancialData();
      fetchAllStudents();
    } catch (err) {
      console.error("Error setting payment:", err);
      alert(
        `Network error: ${err.message}. Please check if the backend server is running.`
      );
    }
  };

  const handleEditPayment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/admin/edit-payment/${editingPayment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amountPaid: parseFloat(editingPayment.amountPaid),
            totalAmount: parseFloat(editingPayment.totalAmount),
            status: editingPayment.status,
            description: editingPayment.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment");
      }

      const result = await response.json();

      if (
        editingPayment.status === "completed" ||
        editingPayment.status === "paid"
      ) {
        const receiptResponse = await fetch(
          `http://localhost:5000/api/finance/admin/generate-receipt/${editingPayment.id}`,
          {
            method: "POST",
          }
        );

        if (receiptResponse.ok) {
          const receiptResult = await receiptResponse.json();
          alert("Payment successfully updated and receipt generated!");
        } else {
          alert("Payment updated but failed to generate receipt.");
        }
      } else {
        alert("Payment successfully updated!");
      }

      setShowEditModal(false);
      setEditingPayment(null);
      fetchFinancialData();
      fetchAllStudents();
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment. Please try again.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // UPDATE your formatDate function:

const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return 'Invalid Date';
  }
};

 // ✅ FIXED: Enhanced receipt fetching with complete payment data
const getReceiptById = async (receiptId) => {
  try {
    if (!receiptId) {
      console.error('No receipt ID provided');
      alert('No receipt ID available');
      return;
    }
    
    console.log('🔍 Fetching complete receipt data for ID:', receiptId);
    
    // First try to get the receipt directly from receipts endpoint
    try {
      const receiptResponse = await fetch(
        `http://localhost:5000/api/finance/receipt/${receiptId}`
      );
      
      if (receiptResponse.ok) {
        const receiptData = await receiptResponse.json();
        console.log('✅ Got complete receipt from API:', receiptData);
        
        // Ensure we have proper balance information
        const enhancedReceipt = {
          ...receiptData,
          balanceInfo: receiptData.balanceInfo || {
            totalDue: receiptData.subtotal || receiptData.total || 0,
            totalPaid: receiptData.total || 0,
            balanceRemaining: Math.max(0, (receiptData.subtotal || 0) - (receiptData.total || 0))
          }
        };
        
        setSelectedReceipt(enhancedReceipt);
        return;
      }
    } catch (receiptErr) {
      console.log('⚠️ Direct receipt endpoint failed, trying transaction data...');
    }
    
    // Fallback: Get transaction data and build receipt
    const transactionResponse = await fetch(
      `http://localhost:5000/api/finance/admin/overview`
    );
    
    if (!transactionResponse.ok) {
      throw new Error('Failed to fetch financial data');
    }
    
    const financialData = await transactionResponse.json();
    const transactions = financialData.recentTransactions || [];
    
    // Find the specific transaction
    const transaction = transactions.find(t => 
      t.id === receiptId || 
      t._id === receiptId ||
      t.transactionId === receiptId
    );
    
    if (!transaction) {
      console.log('❌ Transaction not found, creating basic receipt');
      await createBasicReceipt(receiptId);
      return;
    }
    
    console.log('✅ Found transaction, building comprehensive receipt:', transaction);
    
    // Build complete receipt with all available data
    const receipt = await buildCompleteReceipt(transaction);
    setSelectedReceipt(receipt);
    
  } catch (err) {
    console.error('❌ Error fetching receipt:', err);
    alert('Failed to load receipt. Please try again.');
  }
};

// ✅ NEW: Helper function to build complete receipt data
const buildCompleteReceipt = async (transaction) => {
  try {
    let studentData = null;
    let paymentData = null;
    let completeReceiptData = null;
    
    // Try to get student details
    // ✅ FIXED: Enhanced student data fetching with proper endpoints
// Try to get student details
if (transaction.studentId) {
  try {
    // Try multiple student endpoints to get complete data
    let studentResponse = await fetch(
      `http://localhost:5000/api/students/${transaction.studentId}`
    );
    
    if (!studentResponse.ok) {
      // Try the admin students endpoint as fallback
      studentResponse = await fetch(
        `http://localhost:5000/api/finance/admin/students`
      );
      
      if (studentResponse.ok) {
        const allStudents = await studentResponse.json();
        studentData = allStudents.find(s => s.id === transaction.studentId);
      }
    } else {
      studentData = await studentResponse.json();
    }
    
    if (studentData) {
      console.log('✅ Got complete student data:', studentData);
    } else {
      console.log('⚠️ Student data not found, using transaction data');
      // Use transaction data as fallback
      studentData = {
        fullName: transaction.student || 'Student',
        email: transaction.studentEmail || 'N/A',
        course: transaction.studentCourse || 'N/A'
      };
    }
  } catch (studentErr) {
    console.log('⚠️ Could not fetch student details, using fallback data');
    studentData = {
      fullName: transaction.student || 'Student',
      email: 'N/A',
      course: 'N/A'
    };
  }
}
    
    // Try to get payment details for breakdown
    if (transaction.studentId) {
      try {
        const paymentsResponse = await fetch(
          `http://localhost:5000/api/finance/student/${transaction.studentId}/payments`
        );
        if (paymentsResponse.ok) {
          const paymentsResult = await paymentsResponse.json();
          if (paymentsResult.success && paymentsResult.payments) {
            paymentData = paymentsResult.payments;
            console.log('✅ Got payment data for breakdown:', paymentData);
          }
        }
      } catch (paymentErr) {
        console.log('⚠️ Could not fetch payment details');
      }
    }
    
    // Calculate payment breakdown from payment data
    const paymentBreakdown = calculatePaymentBreakdown(paymentData);
    
    // Build receipt items from transaction and payment data
    const receiptItems = buildReceiptItems(transaction, paymentData);
    
    const receipt = {
      id: transaction.id || transaction._id,
      receiptNumber: transaction.transactionId || `TXN-${(transaction.id || transaction._id || '').toString().slice(-8).toUpperCase()}`,
      
      // Student information
      student: studentData?.fullName || transaction.student || 'Student',
      studentId: transaction.studentId || 'N/A',
      studentEmail: studentData?.email || 'N/A',
      studentCourse: studentData?.course || 'N/A',
      
      // Transaction details
      date: transaction.date ? new Date(transaction.date) : new Date(),
      time: transaction.date ? new Date(transaction.date).toLocaleTimeString() : new Date().toLocaleTimeString(),
      transactionId: transaction.transactionId || transaction.id || 'N/A',
      paymentMethod: transaction.paymentMethod || 'bank_transfer',
      status: transaction.status || 'completed',
      
      // Payment items with detailed breakdown
      items: receiptItems,
      
      // Financial details
      subtotal: Math.abs(transaction.amount) || 0,
      tax: 0,
      total: Math.abs(transaction.amount) || 0,
      
      // ✅ ENHANCED: Complete balance information with payment breakdown
      balanceInfo: {
        totalDue: paymentBreakdown.totalDue,
        totalPaid: paymentBreakdown.totalPaid,
        balanceRemaining: paymentBreakdown.balanceRemaining,
        paymentBreakdown: paymentBreakdown.breakdown // Detailed payment items
      }
    };
    
    console.log('✅ Built comprehensive receipt with payment breakdown:', receipt);
    return receipt;
    
  } catch (error) {
    console.error('Error building complete receipt:', error);
    throw error;
  }
};

// ✅ NEW: Calculate detailed payment breakdown
const calculatePaymentBreakdown = (paymentData) => {
  if (!paymentData || !Array.isArray(paymentData)) {
    return {
      totalDue: 0,
      totalPaid: 0,
      balanceRemaining: 0,
      breakdown: []
    };
  }
  
  const breakdown = paymentData.map(payment => ({
    description: payment.description || 'Payment',
    totalAmount: payment.amount || 0,
    amountPaid: payment.amountPaid || 0,
    amountRemaining: Math.max(0, (payment.amount || 0) - (payment.amountPaid || 0)),
    status: payment.status || 'pending',
    dueDate: payment.dueDate || null,
    type: payment.type || 'general'
  }));
  
  const totalDue = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPaid = breakdown.reduce((sum, item) => sum + item.amountPaid, 0);
  const balanceRemaining = Math.max(0, totalDue - totalPaid);
  
  return {
    totalDue,
    totalPaid,
    balanceRemaining,
    breakdown
  };
};

// ✅ NEW: Build detailed receipt items
const buildReceiptItems = (transaction, paymentData) => {
  const items = [];
  
  // Add the main transaction item
  items.push({
    description: transaction.description || 'Payment Transaction',
    amount: Math.abs(transaction.amount) || 0,
    type: 'payment'
  });
  
  // Add detailed payment items if available
  if (paymentData && Array.isArray(paymentData)) {
    paymentData.forEach(payment => {
      if (payment.amountPaid > 0) {
        items.push({
          description: `${payment.description} (Paid)`,
          amount: payment.amountPaid,
          type: payment.type || 'payment'
        });
      }
    });
  }
  
  return items;
};

// ✅ ENHANCED: Create receipt from transaction with full data
const createReceiptFromTransaction = async (transactionData) => {
  try {
    console.log('🔄 Creating receipt from transaction:', transactionData);
    
    let studentData = null;
    let paymentData = null;
    
    // Fetch complete student details
    if (transactionData.studentId) {
      try {
        const studentResponse = await fetch(
          `http://localhost:5000/api/students/${transactionData.studentId}`
        );
        if (studentResponse.ok) {
          studentData = await studentResponse.json();
          console.log('✅ Got student data:', studentData);
        }
      } catch (studentErr) {
        console.log('⚠️ Could not fetch student details');
      }
    }
    
    // Fetch payment details
    if (transactionData.paymentId && transactionData.studentId) {
      try {
        const paymentResponse = await fetch(
          `http://localhost:5000/api/finance/student/${transactionData.studentId}/payments`
        );
        if (paymentResponse.ok) {
          const paymentsResult = await paymentResponse.json();
          if (paymentsResult.success && paymentsResult.payments) {
            paymentData = paymentsResult.payments.find(p => 
              p._id === transactionData.paymentId || 
              p.id === transactionData.paymentId
            );
            console.log('✅ Got payment data:', paymentData);
          }
        }
      } catch (paymentErr) {
        console.log('⚠️ Could not fetch payment details');
      }
    }
    
    const receipt = {
      id: transactionData.id || transactionData._id,
      receiptNumber: `TXN-${(transactionData.transactionId || transactionData.id || 'UNKNOWN').slice(-12).toUpperCase()}`,
      student: studentData?.fullName || transactionData.studentName || transactionData.student || 'Student',
      studentId: transactionData.studentId || 'N/A',
      studentEmail: studentData?.email || 'N/A',
      studentCourse: studentData?.course || 'N/A',
      date: transactionData.date ? new Date(transactionData.date) : new Date(),
      time: transactionData.date ? new Date(transactionData.date).toLocaleTimeString() : new Date().toLocaleTimeString(),
      transactionId: transactionData.transactionId || transactionData.id,
      paymentMethod: transactionData.paymentMethod || 'bank_transfer',
      items: [
        {
          description: paymentData?.description || transactionData.description || 'Payment',
          amount: Math.abs(transactionData.amount) || 0
        }
      ],
      subtotal: Math.abs(transactionData.amount) || 0,
      tax: 0,
      total: Math.abs(transactionData.amount) || 0,
      status: transactionData.status || 'completed',
      balanceInfo: paymentData ? {
        totalDue: paymentData.amount || Math.abs(transactionData.amount),
        totalPaid: paymentData.amountPaid || Math.abs(transactionData.amount),
        balanceRemaining: Math.max(0, (paymentData.amount || 0) - (paymentData.amountPaid || 0))
      } : {
        totalDue: Math.abs(transactionData.amount) || 0,
        totalPaid: Math.abs(transactionData.amount) || 0,
        balanceRemaining: 0
      }
    };
    
    console.log('✅ Created comprehensive receipt:', receipt);
    setSelectedReceipt(receipt);
    
  } catch (error) {
    console.error('Error creating receipt from transaction:', error);
    alert('Failed to create receipt. Please try again.');
  }
};

// ✅ This function is now just a simple fallback
const createBasicReceipt = async (receiptId) => {
  const basicReceipt = {
    id: receiptId,
    receiptNumber: `TEMP-${receiptId.slice(-8)}`,
    student: 'Student',
    studentId: 'N/A',
    studentEmail: 'N/A',
    studentCourse: 'N/A',
    date: new Date(),
    time: new Date().toLocaleTimeString(),
    transactionId: receiptId,
    paymentMethod: 'Online',
    items: [{
      description: 'Payment Transaction',
      amount: 0
    }],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'completed',
    balanceInfo: {
      totalDue: 0,
      totalPaid: 0,
      balanceRemaining: 0
    }
  };
  
  setSelectedReceipt(basicReceipt);
  alert('Showing basic receipt. Complete data unavailable.');
};


  const handleExportReport = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/admin/finance/export`
      );
      const data = await response.json();

      const csvContent = convertToCSV(data);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting report:", err);
      alert("Failed to export report");
    }
  };

  const convertToCSV = (data) => {
    const headers = [
      "Date",
      "Student",
      "Student ID",
      "Description",
      "Amount",
      "Type",
      "Status",
    ];
    const rows = data.transactions.map((transaction) => [
      formatDate(transaction.date),
      transaction.student,
      transaction.studentId,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.status,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  if (loading) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={styles.errorState}>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchFinancialData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!financialData) return null;

  const PaymentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
      setPaymentForm(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>Set Payment for Student</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleSetPayment} style={{ padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Select Student
              </label>
              <select
                value={selectedStudent?.id || ""}
                onChange={(e) => {
                  const studentId = e.target.value;
                  const student = students.find((s) => s.id === studentId);
                  setSelectedStudent(student);
                }}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} (ID: {student.id})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Payment Type
              </label>
              <select
                value={paymentForm.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <option value="tuition">Tuition</option>
                <option value="housing">Housing</option>
                <option value="meal">Meal Plan</option>
                <option value="fees">Fees</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Description
              </label>
              <input
                type="text"
                value={paymentForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Fall 2024 Tuition"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Amount
              </label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Set Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditPaymentModal = ({ isOpen, onClose }) => {
  if (!isOpen || !editingPayment) return null;

  const amountRemaining = editingPayment.totalAmount - editingPayment.amountPaid;

  const handleInputChange = (field, value) => {
    setEditingPayment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Payment Record</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleEditPayment} style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Student
            </label>
            <input
              type="text"
              value={editingPayment.studentName}
              disabled
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Description
            </label>
            <input
              type="text"
              value={editingPayment.description || ""}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter payment description"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Total Amount
            </label>
            <input
              type="number"
              value={editingPayment.totalAmount || ""}
              onChange={(e) => handleInputChange('totalAmount', e.target.value)}
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Amount Paid
            </label>
            <input
              type="number"
              value={editingPayment.amountPaid || ""}
              onChange={(e) => handleInputChange('amountPaid', e.target.value)}
              step="0.01"
              min="0"
              max={editingPayment.totalAmount}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>

          {/* ✅ ADD DUE DATE EDITING */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Due Date
            </label>
            <input
              type="date"
              value={editingPayment.dueDate ? editingPayment.dueDate.split('T')[0] : ""}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            />
          </div>

          {/* ✅ ADD PAYMENT TYPE EDITING */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Payment Type
            </label>
            <select
              value={editingPayment.type || "tuition"}
              onChange={(e) => handleInputChange('type', e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <option value="tuition">Tuition</option>
              <option value="housing">Housing</option>
              <option value="meal">Meal Plan</option>
              <option value="fees">Fees</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #e2e8f0" }}>
              <span>Amount Remaining:</span>
              <strong style={{ color: amountRemaining > 0 ? "#ef4444" : "#10b981" }}>
                {formatCurrency(Math.max(0, amountRemaining))}
              </strong>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Status
            </label>
            <select
              value={editingPayment.status || "pending"}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
              }}
            >
              <option value="pending">Pending</option>
              <option value="partial">Partially Paid</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                cursor: "pointer",
              }}
            >
              Update Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

 // In your ReceiptModal component - UPDATE the receipt data handling:

// In your ReceiptModal component - ENHANCED VERSION
const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  // ✅ IMPROVED: Better fallbacks for student information
  const studentName = receipt.student || receipt.studentName || 'Student';
  const studentId = receipt.studentId || 'N/A';
  
  // ✅ FIX: Get student email and course with better fallbacks
  const studentEmail = receipt.studentEmail || 
                      (receipt.studentInfo ? receipt.studentInfo.email : 'N/A') || 
                      'N/A';
  
  const studentCourse = receipt.studentCourse || 
                       (receipt.studentInfo ? receipt.studentInfo.course : 'N/A') || 
                       'N/A';

  // ✅ FIX: Calculate proper amounts
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

  // ✅ FIX: Handle date properly
  const receiptDate = receipt.date ? new Date(receipt.date) : new Date();
  const formattedDate = formatDate(receiptDate);
  const formattedTime = receipt.time || receiptDate.toLocaleTimeString();

  const handlePrint = () => {
    const receiptContent = document.getElementById("receipt-content");
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = receiptContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleSendToStudent = async () => {
    if (!receipt.id && !receipt._id) {
      alert('No receipt ID available');
      return;
    }
    
    const receiptId = receipt.id || receipt._id;
    await sendReceiptToStudent(receiptId);
  };

  const currentStatus = sendStatus[receipt.id || receipt._id] || '';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>Payment Receipt</h2>
          <div className={styles.modalActions}>
            {/* <button 
              className={styles.sendButton} 
              onClick={handleSendToStudent}
              disabled={currentStatus === 'sending'}
            >
              {currentStatus === 'sending' ? 'Sending...' : 
               currentStatus === 'sent' ? '✓ Sent' : 
               currentStatus === 'error' ? '✗ Failed' : 
               '📧 Send to Student'}
            </button> */}
            <button className={styles.downloadButton} onClick={handlePrint}>
              Print Receipt
            </button>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className={styles.receiptContainer}>
          <div id="receipt-content" className={styles.receipt}>
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
                  {receipt.receiptNumber || `RCP-${receipt.id || receipt._id}`}
                </p>
              </div>
            </div>

            <div className={styles.receiptInfo}>
  <div className={styles.infoSection}>
    <h4>Student Information</h4>
    <p><strong>Name:</strong> {studentName}</p>
    <p><strong>Student ID:</strong> {studentId}</p>
    <p><strong>Email:</strong> 
      <span style={{ 
        color: studentEmail === 'N/A' ? '#ef4444' : 'inherit',
        fontStyle: studentEmail === 'N/A' ? 'italic' : 'normal'
      }}>
        {studentEmail}
      </span>
    </p>
    <p><strong>Course:</strong> 
      <span style={{ 
        color: studentCourse === 'N/A' ? '#ef4444' : 'inherit',
        fontStyle: studentCourse === 'N/A' ? 'italic' : 'normal'
      }}>
        {studentCourse}
      </span>
    </p>
  </div>
  <div className={styles.infoSection}>
    <h4>Transaction Details</h4>
    <p><strong>Date:</strong> {formattedDate}</p>
    <p><strong>Time:</strong> {formattedTime}</p>
    <p><strong>Transaction ID:</strong> {receipt.transactionId || receipt.id || 'N/A'}</p>
    <p><strong>Payment Method:</strong> {receipt.paymentMethod || 'Online'}</p>
  </div>
</div>

            {/* Rest of your receipt content remains the same */}
            <div className={styles.receiptItems}>
              <h4>Payment Details</h4>
              <div className={styles.itemsHeader}>
                <span>Description</span>
                <span>Amount</span>
              </div>
              {receiptItems.map((item, index) => (
                <div key={index} className={styles.itemRow}>
                  <span>{item.description || 'Payment'}</span>
                  <span className={item.amount < 0 ? styles.credit : styles.debit}>
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
                  Balance: {formatCurrency(balanceInfo.balanceRemaining)}
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
    <div className={styles.fullScreenContainer}>
      <div className={styles.financePage}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Finance Administration Dashboard</h1>
              <p className={styles.subtitle}>
                financial activities and transactions
              </p>
            </div>
            <div className={styles.headerActions}>
              <select
                className={styles.timeRangeSelect}
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button
                className={styles.exportButton}
                onClick={handleExportReport}
              >
                📊 Export Report
              </button>
            </div>
          </div>
        </header>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "var(--emerald)" }}
            >
              💰
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Total Revenue</h3>
              <p className={styles.statValue}>
                {formatCurrency(financialData.totalRevenue)}
              </p>
              <p className={styles.statTrend}>
                <span style={{ color: "var(--emerald)" }}>
                  ↑ {financialData.revenueTrend}%
                </span>{" "}
                from last month
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "var(--ruby)" }}
            >
              ⚠️
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Pending Payments</h3>
              <p className={styles.statValue}>
                {formatCurrency(financialData.pendingPayments)}
              </p>
              <p className={styles.statTrend}>
                {financialData.topStudents.length} students with balances
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "var(--sky)" }}
            >
              📈
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Collected This Month</h3>
              <p className={styles.statValue}>
                {formatCurrency(financialData.collectedThisMonth)}
              </p>
              <p className={styles.statTrend}>
                {financialData.collectionRate}% collection rate
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "var(--gold)" }}
            >
              ⚖️
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Outstanding Balance</h3>
              <p className={styles.statValue}>
                {formatCurrency(financialData.outstandingBalance)}
              </p>
              <p className={styles.statTrend}>Across all student accounts</p>
            </div>
          </div>
        </div>

        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${
              activeTab === "overview" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            📊 Dashboard
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "students" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            👥 Manage Students
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "transactions" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("transactions")}
          >
            💳 Transactions
          </button>
          
          <button
            className={`${styles.tab} ${
              activeTab === "analytics" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            📈 Analytics
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={`${styles.section} ${styles.chartSection}`}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Revenue Distribution by Category
                  </h2>
                  <span className={styles.sectionSubtitle}>
                    Current fiscal period
                  </span>
                </div>
                <div className={styles.distributionChart}>
                  {financialData.paymentDistribution.map((item, index) => (
                    <div key={item.category} className={styles.chartItem}>
                      <div className={styles.chartBar}>
                        <div
                          className={styles.chartFill}
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                      <div className={styles.chartLabel}>
                        <div
                          className={styles.chartColor}
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className={styles.chartCategory}>
                          {item.category}
                        </span>
                        <span className={styles.chartAmount}>
                          {formatCurrency(item.amount)}
                        </span>
                        <span className={styles.chartPercentage}>
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>
                    Top Outstanding Balances
                  </h2>
                  <button className={styles.viewAllButton}>
                     Students
                  </button>
                </div>
                <div className={styles.studentsList}>
                  {financialData.topStudents.map((student, index) => (
                    <div key={student.id} className={styles.studentItem}>
                      <div className={styles.studentRank}>#{index + 1}</div>
                      <div className={styles.studentInfo}>
                        <h4 className={styles.studentName}>{student.name}</h4>
                        <p className={styles.studentId}>{student.id}</p>
                      </div>
                      <div className={styles.studentBalance}>
                        {formatCurrency(student.balance)}
                      </div>
                      <div
                        className={`${styles.statusBadge} ${
                          student.status === "Overdue"
                            ? styles.statusOverdue
                            : student.status === "Due Soon"
                            ? styles.statusDueSoon
                            : styles.statusCurrent
                        }`}
                      >
                        {student.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Transactions</h2>
                  <button className={styles.viewAllButton}>
                     Transactions
                  </button>
                </div>
                <div className={styles.transactionList}>
                  {financialData.recentTransactions
                    .slice(0, 5)
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className={styles.transactionItem}
                      >
                        <div className={styles.transactionIcon}>
                          {transaction.type === "payment" ? "↗️" : "↙️"}
                        </div>
                        <div className={styles.transactionInfo}>
                          <h4 className={styles.transactionDescription}>
                            {transaction.description}
                          </h4>
                          <p className={styles.transactionStudent}>
                            {transaction.student} •{" "}
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                        <div
                          className={`${styles.transactionAmount} ${
                            transaction.amount > 0
                              ? styles.debit
                              : styles.credit
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </div>
                       
                        <button
                          className={styles.receiptButton}
                          onClick={() => {
                            console.log('Transaction clicked:', transaction);
                            if (transaction.id) {
                              getReceiptById(transaction.id);
                            } else {
                              console.warn('No transaction ID available');
                              alert('No receipt available for this transaction');
                            }
                          }}
                          title="View Receipt"
                        >
                          🧾
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className={styles.transactionsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Student Payment Management
                </h2>
                <div className={styles.transactionFilters}>
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    className={styles.searchInput}
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase().trim();
                      
                      if (searchTerm === "") {
                        fetchAllStudents();
                        return;
                      }
                      
                      const filteredStudents = students.filter(student => 
                        student.name?.toLowerCase().includes(searchTerm) ||
                        student.id?.toLowerCase().includes(searchTerm)
                      );
                      
                      setStudents(filteredStudents);
                    }}
                  />
                  <button
                    className={styles.exportButton}
                    onClick={() => {
                      console.log("Opening payment modal for new payment");
                      setShowPaymentModal(true);
                    }}
                  >
                    + Add Payment
                  </button>
                  <button
                    className={styles.refreshButton}
                    onClick={() => {
                      console.log("Refreshing student data...");
                      fetchAllStudents();
                      fetchFinancialData();
                    }}
                    style={{ marginLeft: "10px", background: "#10b981" }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              <div style={{ 
                background: '#f8fafc', 
                padding: '8px 16px', 
                marginBottom: '15px', 
                borderRadius: '5px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                {students.length === 0 && ' - No students match your search criteria'}
              </div>

              <div className={styles.transactionTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Student</div>
                  <div className={styles.tableCell}>Total Due</div>
                  <div className={styles.tableCell}>Amount Paid</div>
                  <div className={styles.tableCell}>Remaining</div>
                  <div className={styles.tableCell}>Status</div>
                  <div className={styles.tableCell}>Actions</div>
                </div>

                {students.length > 0 ? (
                  students.map((student) => {
                    const totalDue = student.totalAmount || 0;
                    const amountPaid = student.amountPaid || 0;
                    const remaining = totalDue - amountPaid;
                    const status =
                      remaining <= 0
                        ? "Completed"
                        : remaining < totalDue
                        ? "Partial"
                        : "Pending";

                    return (
                      <div key={student.id} className={styles.tableRow}>
                        <div className={styles.tableCell}>
                          <div>
                            <div className={styles.studentName}>
                              {student.name}
                            </div>
                            <div className={styles.studentId}>
                              ID: {student.id}
                            </div>
                            {student.payments &&
                              student.payments.length > 0 && (
                                <div className={styles.paymentCount}>
                                  {student.payments.length} payment(s)
                                </div>
                              )}
                            {student.payments &&
                              student.payments.length === 0 && (
                                <div
                                  className={styles.paymentCount}
                                  style={{ color: "#ef4444" }}
                                >
                                  No payments set
                                </div>
                              )}
                          </div>
                        </div>
                        <div className={styles.tableCell}>
                          {formatCurrency(totalDue)}
                        </div>
                        <div className={`${styles.tableCell} ${styles.credit}`}>
                          {formatCurrency(amountPaid)}
                        </div>
                        <div
                          className={`${styles.tableCell} ${
                            remaining > 0 ? styles.debit : styles.credit
                          }`}
                        >
                          {formatCurrency(remaining)}
                        </div>
                        <div className={styles.tableCell}>
                          <span
                            className={`${styles.statusBadge} ${
                              status === "Completed"
                                ? styles.statusCompleted
                                : status === "Partial"
                                ? styles.statusPartial
                                : styles.statusPending
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className={styles.tableCell}>
                          <button
                            className={styles.receiptLink}
                            onClick={() => {
                              console.log("Setting payment for:", student.name);
                              setSelectedStudent(student);
                              setShowPaymentModal(true);
                            }}
                            style={{ marginRight: "8px" }}
                          >
                            Set Payment
                          </button>
                          
                          {/* Updated Edit Payment Button */}
                          <button
                            className={styles.receiptLink}
                            onClick={async () => {
                              console.log("Viewing payments for:", student.name);
                              const payments = student.payments || [];
                              
                              if (payments.length === 0) {
                                alert("No payments found for this student. Please set a payment first.");
                                return;
                              }
                              
                              if (payments.length === 1) {
                                // If only one payment, edit it directly
                                const paymentToEdit = payments[0];
                                setEditingPayment({
                                  id: paymentToEdit.id,
                                  studentId: student.id,
                                  studentName: student.name,
                                  description: paymentToEdit.description || "Payment",
                                  totalAmount: paymentToEdit.amount || paymentToEdit.totalAmount || totalDue,
                                  amountPaid: paymentToEdit.amountPaid || amountPaid,
                                  status: paymentToEdit.status || status.toLowerCase(),
                                  dueDate: paymentToEdit.dueDate || "",
                                  type: paymentToEdit.type || "tuition"
                                });
                                setShowEditModal(true);
                              } else {
                                // If multiple payments, show selection modal
                                setSelectedStudentPayments(payments);
                                setSelectedStudent(student);
                                setShowPaymentsModal(true);
                              }
                            }}
                          >
                            {student.payments?.length === 1 ? "Edit Payment" : "View Payments"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.tableRow}>
                    <div
                      className={styles.tableCell}
                      style={{ textAlign: "center", padding: "20px", gridColumn: "1 / -1" }}
                    >
                      <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>🔍</div>
                        <h4>No Students Found</h4>
                        <p>No students match your search criteria. Try a different name or student ID.</p>
                        <button
                          className={styles.clearButton}
                          onClick={() => {
                            const searchInput = document.querySelector(`.${styles.searchInput}`);
                            if (searchInput) searchInput.value = "";
                            fetchAllStudents();
                          }}
                          style={{ marginTop: "10px" }}
                        >
                          Show All Students
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className={styles.transactionsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Transactions</h2>
                <div className={styles.transactionFilters}>
                  <div className={styles.searchContainer}>
                    <input
                      type="text"
                      placeholder="Search by student name, ID, or description..."
                      className={styles.searchInput}
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        
                        if (searchTerm === '') {
                          setTransactions(financialData.recentTransactions);
                          return;
                        }
                        
                        const filtered = financialData.recentTransactions.filter(transaction => 
                          transaction.student?.toLowerCase().includes(searchTerm) ||
                          transaction.id?.toLowerCase().includes(searchTerm) ||
                          transaction.studentId?.toLowerCase().includes(searchTerm) ||
                          transaction.description?.toLowerCase().includes(searchTerm)
                        );
                        
                        setTransactions(filtered);
                      }}
                    />
                    {transactions.length !== financialData.recentTransactions.length && (
                      <button
                        className={styles.clearSearchButton}
                        onClick={() => {
                          const searchInput = document.querySelector(`.${styles.searchInput}`);
                          if (searchInput) searchInput.value = '';
                          setTransactions(financialData.recentTransactions);
                        }}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.filterControls}>
                    <select 
                      className={styles.filterSelect}
                      onChange={(e) => {
                        const filterType = e.target.value;
                        let filtered = financialData.recentTransactions;
                        
                        if (filterType === 'payment') {
                          filtered = filtered.filter(t => t.amount > 0);
                        } else if (filterType === 'credit') {
                          filtered = filtered.filter(t => t.amount < 0);
                        } else if (filterType === 'completed') {
                          filtered = filtered.filter(t => t.status === 'completed');
                        } else if (filterType === 'pending') {
                          filtered = filtered.filter(t => t.status === 'pending');
                        }
                        
                        setTransactions(filtered);
                        
                        const searchInput = document.querySelector(`.${styles.searchInput}`);
                        if (searchInput) searchInput.value = '';
                      }}
                    >
                      <option value="all">All Transactions</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                    
                    <button
                      className={styles.refreshButton}
                      onClick={() => {
                        fetchFinancialData();
                        setTransactions(financialData.recentTransactions);
                        const searchInput = document.querySelector(`.${styles.searchInput}`);
                        const filterSelect = document.querySelector(`.${styles.filterSelect}`);
                        if (searchInput) searchInput.value = '';
                        if (filterSelect) filterSelect.value = 'all';
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.searchInfo}>
                <div className={styles.resultsCount}>
                  Showing {transactions.length} of {financialData.recentTransactions.length} transactions
                  {transactions.length !== financialData.recentTransactions.length && (
                    <button
                      className={styles.showAllButton}
                      onClick={() => {
                        setTransactions(financialData.recentTransactions);
                        const searchInput = document.querySelector(`.${styles.searchInput}`);
                        const filterSelect = document.querySelector(`.${styles.filterSelect}`);
                        if (searchInput) searchInput.value = '';
                        if (filterSelect) filterSelect.value = 'all';
                      }}
                    >
                      Show All
                    </button>
                  )}
                </div>
              </div>
              
              <div className={styles.transactionTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Student</div>
                  <div className={styles.tableCell}>Description</div>
                  <div className={styles.tableCell}>Date</div>
                  <div className={styles.tableCell}>Amount</div>
                  <div className={styles.tableCell}>Status</div>
                  <div className={styles.tableCell}>Receipt</div>
                </div>
                
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className={styles.tableRow}>
                      <div className={styles.tableCell}>
                        <div>
                          <div className={styles.studentName}>
                            {transaction.student}
                          </div>
                          <div className={styles.studentId}>
                            ID: {transaction.studentId || transaction.id}
                          </div>
                        </div>
                      </div>
                      <div className={styles.tableCell}>
                        {transaction.description}
                      </div>
                      <div className={styles.tableCell}>
                        {formatDate(transaction.date)}
                      </div>
                      <div
                        className={`${styles.tableCell} ${
                          transaction.amount > 0 ? styles.debit : styles.credit
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={styles.tableCell}>
                        <span
                          className={`${styles.statusBadge} ${
                            transaction.status === "completed"
                              ? styles.statusCompleted
                              : transaction.status === "pending"
                              ? styles.statusPending
                              : styles.statusPartial
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <div className={styles.receiptActions}>
                          <button
                            className={styles.receiptLink}
                            onClick={() => {
                              console.log('Transaction receipt clicked:', transaction);
                              if (transaction.id) {
                                getReceiptById(transaction.id);
                              } else {
                                console.warn('No transaction ID available');
                                alert('No receipt available for this transaction');
                              }
                            }}
                          >
                            View Receipt
                          </button>
                          {/* <button
                            className={styles.sendReceiptButton}
                            onClick={() => sendReceiptToStudent(transaction.id)}
                            disabled={sendStatus[transaction.id] === 'sending'}
                            title="Send receipt to student"
                          >
                            {sendStatus[transaction.id] === 'sending' ? '⏳' : 
                             sendStatus[transaction.id] === 'sent' ? '✓' : 
                             sendStatus[transaction.id] === 'error' ? '✗' : '📧'}
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell} style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1" }}>
                      <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>🔍</div>
                        <h3>No Transactions Found</h3>
                        <p>No transactions match your current search criteria.</p>
                        <button
                          className={styles.clearFiltersButton}
                          onClick={() => {
                            setTransactions(financialData.recentTransactions);
                            const searchInput = document.querySelector(`.${styles.searchInput}`);
                            const filterSelect = document.querySelector(`.${styles.filterSelect}`);
                            if (searchInput) searchInput.value = '';
                            if (filterSelect) filterSelect.value = 'all';
                          }}
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.analyticsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Financial Analytics</h2>
                <div className={styles.analyticsFilters}>
                  <select 
                    className={styles.filterSelect}
                    onChange={(e) => {
                      const viewType = e.target.value;
                      console.log("View type changed to:", viewType);
                    }}
                  >
                    <option value="monthly">Monthly View</option>
                    <option value="quarterly">Quarterly View</option>
                    <option value="yearly">Yearly View</option>
                  </select>
                  <button 
                    className={styles.exportButton}
                    onClick={() => exportAnalyticsData()}
                  >
                    📊 Export Analytics
                  </button>
                </div>
              </div>

              <div className={styles.analyticsSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon} style={{ background: '#10b981' }}>💰</div>
                  <div className={styles.summaryContent}>
                    <h4>Total Revenue</h4>
                    <p className={styles.summaryValue}>{formatCurrency(financialData.totalRevenue)}</p>
                    <p className={styles.summaryTrend} style={{ color: '#10b981' }}>
                      ↑ {financialData.revenueTrend}% from last period
                    </p>
                  </div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon} style={{ background: '#3b82f6' }}>📈</div>
                  <div className={styles.summaryContent}>
                    <h4>Collection Rate</h4>
                    <p className={styles.summaryValue}>{financialData.collectionRate}%</p>
                    <p className={styles.summaryTrend}>Overall performance</p>
                  </div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon} style={{ background: '#ef4444' }}>⚖️</div>
                  <div className={styles.summaryContent}>
                    <h4>Outstanding Balance</h4>
                    <p className={styles.summaryValue}>{formatCurrency(financialData.outstandingBalance)}</p>
                    <p className={styles.summaryTrend}>{financialData.topStudents.length} students</p>
                  </div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon} style={{ background: '#f59e0b' }}>🔄</div>
                  <div className={styles.summaryContent}>
                    <h4>Pending Payments</h4>
                    <p className={styles.summaryValue}>{formatCurrency(financialData.pendingPayments)}</p>
                    <p className={styles.summaryTrend}>Awaiting processing</p>
                  </div>
                </div>
              </div>

              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Revenue Trend</h3>
                    <div className={styles.chartLegend}>
                      <span className={styles.legendItem}>
                        <span className={styles.legendColor} style={{ background: '#3b82f6' }}></span>
                        Current Period
                      </span>
                      <span className={styles.legendItem}>
                        <span className={styles.legendColor} style={{ background: '#d1d5db' }}></span>
                        Previous Period
                      </span>
                    </div>
                  </div>
                  <div className={styles.chartContainer}>
                    <div className={styles.barChart}>
                      {generateRevenueBars()}
                    </div>
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Collection Performance</h3>
                    <div className={styles.chartStats}>
                      <span className={styles.stat}>Target: 95%</span>
                      <span className={styles.stat}>Current: {financialData.collectionRate}%</span>
                    </div>
                  </div>
                  <div className={styles.chartContainer}>
                    <div className={styles.gaugeChart}>
                      <div 
                        className={styles.gaugeFill}
                        style={{ height: `${financialData.collectionRate}%` }}
                      ></div>
                      <div className={styles.gaugeLabel}>
                        {financialData.collectionRate}%
                      </div>
                    </div>
                    <div className={styles.gaugeMarks}>
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Payment Methods Distribution</h3>
                  </div>
                  <div className={styles.chartContainer}>
                    <div className={styles.pieChart}>
                      {renderPaymentMethods()}
                    </div>
                    <div className={styles.pieLegend}>
                      {financialData.paymentDistribution.map((method, index) => (
                        <div key={method.category} className={styles.legendItem}>
                          <span 
                            className={styles.legendColor} 
                            style={{ background: method.color }}
                          ></span>
                          <span className={styles.legendText}>{method.category}</span>
                          <span className={styles.legendValue}>{method.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Outstanding Balances Trend</h3>
                    <select className={styles.miniFilter}>
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                      <option>All Time</option>
                    </select>
                  </div>
                  <div className={styles.chartContainer}>
                    <div className={styles.lineChart}>
                      {renderBalanceTrend()}
                    </div>
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Top Students by Outstanding Balance</h3>
                  </div>
                  <div className={styles.studentsRanking}>
                    {financialData.topStudents.slice(0, 5).map((student, index) => (
                      <div key={student.id} className={styles.rankingItem}>
                        <div className={styles.rank}>#{index + 1}</div>
                        <div className={styles.studentInfo}>
                          <div className={styles.studentName}>{student.name}</div>
                          <div className={styles.studentId}>{student.id}</div>
                        </div>
                        <div className={styles.balanceAmount}>
                          {formatCurrency(student.balance)}
                        </div>
                        <div className={`${styles.status} ${getStatusClass(student.status)}`}>
                          {student.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.analyticsCard}>
                  <div className={styles.chartHeader}>
                    <h3>Payment Status Overview</h3>
                  </div>
                  <div className={styles.chartContainer}>
                    <div className={styles.statusChart}>
                      {renderPaymentStatus()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
            setPaymentForm({
              amount: "",
              description: "",
              dueDate: "",
              type: "tuition",
            });
          }}
        />

        {/* Add this new modal */}
        <PaymentsModal
          isOpen={showPaymentsModal}
          onClose={() => {
            setShowPaymentsModal(false);
            setSelectedStudentPayments([]);
            setSelectedStudent(null);
          }}
          payments={selectedStudentPayments}
          student={selectedStudent}
        />

        <EditPaymentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPayment(null);
          }}
        />

        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      </div>
    </div>
  );
};

export default FinancePage;