import { useEffect, useState } from "react";
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

  // New state for admin payment management
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

  // Fetch financial data from API
  useEffect(() => {
    fetchFinancialData();
    fetchAllStudents();
  }, [timeRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      // Use admin overview endpoint instead of student endpoint
      const url = `http://localhost:5000/api/finance/admin/overview`;
      console.log("Fetching admin financial data from:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched admin data:", data);

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
        recentTransactions: Array.isArray(data.recentTransactions)
          ? data.recentTransactions
          : [],
        receipts: Array.isArray(data.receipts) ? data.receipts : [],
      });
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load financial data.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch actual payments for a student
  const fetchStudentPayments = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/student/${studentId}/payments`
      );
      if (response.ok) {
        const data = await response.json();
        return data.payments || []; // Now returns the payments array directly
      }
      return [];
    } catch (err) {
      console.error("Error fetching student payments:", err);
      return [];
    }
  };

  // Fetch all students with payment data
  // In your fetchAllStudents function, ensure it calculates from actual payments
  const fetchAllStudents = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/finance/admin/students"
      );
      if (!response.ok) {
        console.log(
          "Admin students endpoint not available, using fallback data"
        );
        // Use fallback with 0 balances
        if (financialData && financialData.topStudents) {
          const mockStudents = await Promise.all(
            financialData.topStudents.map(async (student) => {
              const payments = await fetchStudentPayments(student.id);
              // Calculate from actual payments only
              const totalAmount = payments.reduce(
                (sum, payment) => sum + (payment.amount || 0),
                0
              );
              const amountPaid = payments.reduce(
                (sum, payment) => sum + (payment.amountPaid || 0),
                0
              );

              return {
                id: student.id,
                name: student.name,
                totalAmount: totalAmount, // Only payments you set
                amountPaid: amountPaid, // Only actual payments
                description: "Tuition Fee",
                payments: payments,
              };
            })
          );
          setStudents(mockStudents);
        }
        return;
      }
      const data = await response.json();

      // Enhance with actual payment data - calculate from payments only
      const studentsWithPayments = await Promise.all(
        data.map(async (student) => {
          const payments = await fetchStudentPayments(student.id);
          // Calculate totals from payments only, not from student.accountBalance
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
            totalAmount: totalAmount, // From payments only
            amountPaid: amountPaid, // From payments only
            payments: payments,
          };
        })
      );

      setStudents(studentsWithPayments);
    } catch (err) {
      console.error("Error fetching students:", err);
      // Fallback with 0 balances
      if (financialData && financialData.topStudents) {
        const mockStudents = financialData.topStudents.map((student) => ({
          id: student.id,
          name: student.name,
          totalAmount: 0, // Start with 0
          amountPaid: 0, // Start with 0
          description: "No payments set",
          payments: [],
        }));
        setStudents(mockStudents);
      }
    }
  };

  const handleGenerateReceipt = async (studentId) => {
    try {
      // First, get the student's payments
      const payments = await fetchStudentPayments(studentId);
      const completedPayment = payments.find(
        (p) => p.status === "completed" || p.status === "paid"
      );

      if (completedPayment) {
        const response = await fetch(
          `http://localhost:5000/api/finance/admin/generate-receipt/${completedPayment.id}`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          const result = await response.json();
          alert("Receipt generated successfully!");
          // Refresh data
          fetchFinancialData();
          fetchAllStudents();
        } else {
          alert("Failed to generate receipt.");
        }
      } else {
        alert("No completed payments found for this student.");
      }
    } catch (err) {
      console.error("Error generating receipt:", err);
      alert("Failed to generate receipt. Please try again.");
    }
  };

  const handleViewPayments = async (studentId) => {
    try {
      const payments = await fetchStudentPayments(studentId);
      if (payments.length > 0) {
        console.log("Student payments:", payments);
        alert(
          `Found ${payments.length} payment(s) for this student. Check console for details.`
        );
      } else {
        alert("No payments found for this student.");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      alert("Failed to fetch payments.");
    }
  };

  // Handler for setting payment for a student
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

        // Try to parse as JSON if possible
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

      // Refresh data
      fetchFinancialData();
      fetchAllStudents();
    } catch (err) {
      console.error("Error setting payment:", err);
      alert(
        `Network error: ${err.message}. Please check if the backend server is running.`
      );
    }
  };

  // Handler for editing payment details with receipt generation - FIXED SYNTAX
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

      // Generate receipt if payment is completed
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
  }; // <-- This was the missing closing brace

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getReceiptById = async (receiptId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/finance/finance/receipt/${receiptId}`
      );
      if (response.ok) {
        const receipt = await response.json();
        setSelectedReceipt(receipt);
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
    }
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

  // Loading state
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

  // Error state
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

  // Payment Modal Component
  const PaymentModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
            {/* Student Selection */}
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
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, type: e.target.value })
                }
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
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    description: e.target.value,
                  })
                }
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

            {/* // In your PaymentModal component - FIX THE AMOUNT INPUT */}
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
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, amount: e.target.value })
                }
                placeholder="0.00"
                step="0.01" // ⚠️ UNCOMMENT THIS LINE
                min="0" // ⚠️ CHANGE FROM min="15" to min="0"
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
                onChange={(e) =>
                  setPaymentForm({ ...paymentForm, dueDate: e.target.value })
                }
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

  // Edit Payment Modal Component
  const EditPaymentModal = ({ isOpen, onClose }) => {
    if (!isOpen || !editingPayment) return null;

    const amountRemaining =
      editingPayment.totalAmount - editingPayment.amountPaid;

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>Edit Payment Record</h2>
            <button className={styles.closeButton} onClick={onClose}>
              ×
            </button>
          </div>

          <form onSubmit={handleEditPayment} style={{ padding: "20px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
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
                value={editingPayment.description}
                onChange={(e) =>
                  setEditingPayment({
                    ...editingPayment,
                    description: e.target.value,
                  })
                }
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
                Total Amount
              </label>
              <input
                type="number"
                value={editingPayment.totalAmount}
                onChange={(e) =>
                  setEditingPayment({
                    ...editingPayment,
                    totalAmount: e.target.value,
                  })
                }
                step="0.01" // ⚠️ UNCOMMENT THIS
                min="0" // ⚠️ UNCOMMENT THIS
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
                Amount Paid
              </label>
              <input
                type="number"
                value={editingPayment.amountPaid}
                onChange={(e) =>
                  setEditingPayment({
                    ...editingPayment,
                    amountPaid: e.target.value,
                  })
                }
                step="0.01" // ⚠️ UNCOMMENT THIS
                min="0" // ⚠️ UNCOMMENT THIS
                max={editingPayment.totalAmount}
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
                marginBottom: "16px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Total Amount:</span>
                <strong>
                  {formatCurrency(parseFloat(editingPayment.totalAmount) || 0)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Amount Paid:</span>
                <strong style={{ color: "#10b981" }}>
                  {formatCurrency(parseFloat(editingPayment.amountPaid) || 0)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <span>Amount Remaining:</span>
                <strong
                  style={{ color: amountRemaining > 0 ? "#ef4444" : "#10b981" }}
                >
                  {formatCurrency(
                    Math.max(
                      0,
                      (parseFloat(editingPayment.totalAmount) || 0) -
                        (parseFloat(editingPayment.amountPaid) || 0)
                    )
                  )}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Status
              </label>
              <select
                value={editingPayment.status}
                onChange={(e) =>
                  setEditingPayment({
                    ...editingPayment,
                    status: e.target.value,
                  })
                }
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
                Update Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    const handlePrint = () => {
      const receiptContent = document.getElementById("receipt-content");
      const originalContents = document.body.innerHTML;

      document.body.innerHTML = receiptContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    };

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>Payment Receipt</h2>
            <div className={styles.modalActions}>
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
                  <p className={styles.receiptId}>{receipt.id}</p>
                </div>
              </div>

              <div className={styles.receiptInfo}>
                <div className={styles.infoSection}>
                  <h4>Student Information</h4>
                  <p>
                    <strong>Name:</strong> {receipt.student}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {receipt.studentId}
                  </p>
                </div>
                <div className={styles.infoSection}>
                  <h4>Transaction Details</h4>
                  <p>
                    <strong>Date:</strong> {formatDate(receipt.date)}
                  </p>
                  <p>
                    <strong>Time:</strong> {receipt.time}
                  </p>
                  <p>
                    <strong>Transaction ID:</strong> {receipt.transactionId}
                  </p>
                </div>
              </div>

              <div className={styles.receiptItems}>
                <h4>Payment Details</h4>
                <div className={styles.itemsHeader}>
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                {receipt.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <span>{item.description}</span>
                    <span
                      className={item.amount < 0 ? styles.credit : styles.debit}
                    >
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.receiptTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(receipt.subtotal)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Tax:</span>
                  <span>{formatCurrency(receipt.tax)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>
                    <strong>Total Amount:</strong>
                  </span>
                  <span>
                    <strong>{formatCurrency(receipt.total)}</strong>
                  </span>
                </div>
              </div>

              <div className={styles.receiptFooter}>
                <div className={styles.paymentMethod}>
                  <p>
                    <strong>Payment Method:</strong> {receipt.paymentMethod}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${styles.statusBadge} ${styles.statusCompleted}`}
                    >
                      {receipt.status}
                    </span>
                  </p>
                </div>
                <div className={styles.receiptStamp}>
                  <div className={styles.stamp}>PAID</div>
                </div>
              </div>

              <div className={styles.receiptNote}>
                <p>
                  This is an official receipt. Please retain for your records.
                </p>
                <p>
                  For any inquiries, contact the Finance Office at
                  finance@university.edu
                </p>
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
              activeTab === "receipts" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("receipts")}
          >
            🧾 Receipts
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
                    View All Students
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
                    View All Transactions
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
                          onClick={() =>
                            setSelectedReceipt(
                              getReceiptById(transaction.receiptId)
                            )
                          }
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
                    placeholder="Search students..."
                    className={styles.searchInput}
                    onChange={(e) => {
                      // Add search functionality here if needed
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

              {/* Add a debug info section */}
              <div
                style={{
                  background: "#f3f4f6",
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "5px",
                  fontSize: "14px",
                }}
              >
                <strong>Debug Info:</strong> Found {students.length} students.
                Check browser console for endpoint status.
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
                          <button
                            className={styles.receiptLink}
                            onClick={async () => {
                              console.log("Editing payment for:", student.name);
                              const payments = student.payments || [];
                              if (payments.length > 0) {
                                setEditingPayment({
                                  id: payments[0].id,
                                  studentId: student.id,
                                  studentName: student.name,
                                  description:
                                    payments[0].description || "Payment",
                                  totalAmount:
                                    payments[0].totalAmount || totalDue,
                                  amountPaid:
                                    payments[0].amountPaid || amountPaid,
                                  status:
                                    payments[0].status || status.toLowerCase(),
                                });
                              } else {
                                alert(
                                  "No payments found for this student. Please set a payment first."
                                );
                                return;
                              }
                              setShowEditModal(true);
                            }}
                          >
                            Edit Payment
                          </button>
                          <button
                            className={styles.receiptLink}
                            onClick={() => handleViewPayments(student.id)}
                            style={{ marginLeft: "8px" }}
                          >
                            View Payments
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.tableRow}>
                    <div
                      className={styles.tableCell}
                      colSpan="6"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      {financialData &&
                      financialData.topStudents &&
                      financialData.topStudents.length > 0 ? (
                        <div>
                          <p>
                            No student data from admin endpoint. Using fallback
                            data.
                          </p>
                          <p>Check if backend endpoints are implemented.</p>
                          <button
                            onClick={testEndpoints}
                            style={{
                              marginTop: "10px",
                              padding: "8px 16px",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Test Backend Endpoints
                          </button>
                        </div>
                      ) : (
                        <p>
                          No student data available. Please check backend
                          connection.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "receipts" && (
            <div className={styles.receiptsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Payment Receipts</h2>
                <div className={styles.receiptFilters}>
                  <select className={styles.filterSelect}>
                    <option>All Receipts</option>
                    <option>This Month</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search receipts..."
                    className={styles.searchInput}
                  />
                </div>
              </div>

              <div className={styles.receiptsGrid}>
                {financialData.receipts.map((receipt) => (
                  <div key={receipt.id} className={styles.receiptCard}>
                    <div className={styles.receiptCardHeader}>
                      <div className={styles.receiptCardId}>{receipt.id}</div>
                      <div className={styles.receiptCardStatus}>
                        <span
                          className={`${styles.statusBadge} ${styles.statusCompleted}`}
                        >
                          {receipt.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.receiptCardBody}>
                      <div className={styles.receiptCardStudent}>
                        <strong>{receipt.student}</strong>
                        <span>{receipt.studentId}</span>
                      </div>
                      <div className={styles.receiptCardDate}>
                        {formatDate(receipt.date)} at {receipt.time}
                      </div>
                      <div
                        className={`${styles.receiptCardAmount} ${
                          receipt.total < 0 ? styles.credit : styles.debit
                        }`}
                      >
                        {formatCurrency(receipt.total)}
                      </div>
                      <div className={styles.receiptCardItems}>
                        {receipt.items.slice(0, 2).map((item, index) => (
                          <div key={index} className={styles.receiptCardItem}>
                            {item.description}
                          </div>
                        ))}
                        {receipt.items.length > 2 && (
                          <div className={styles.receiptCardMore}>
                            +{receipt.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.receiptCardFooter}>
                      <div className={styles.receiptCardMethod}>
                        {receipt.paymentMethod}
                      </div>
                      <button
                        className={styles.viewReceiptButton}
                        onClick={() => setSelectedReceipt(receipt)}
                      >
                        View Full Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className={styles.transactionsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>All Transactions</h2>
                <div className={styles.transactionFilters}>
                  <select className={styles.filterSelect}>
                    <option>All Transactions</option>
                    <option>Payments Only</option>
                    <option>Credits Only</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className={styles.searchInput}
                  />
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
                {financialData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <div>
                        <div className={styles.studentName}>
                          {transaction.student}
                        </div>
                        <div className={styles.studentId}>
                          ID: {transaction.id}
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
                            : styles.statusPending
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <div className={styles.tableCell}>
                      <button
                        className={styles.receiptLink}
                        onClick={() =>
                          setSelectedReceipt(
                            getReceiptById(transaction.receiptId)
                          )
                        }
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className={styles.analyticsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Financial Analytics</h2>
                <div className={styles.analyticsFilters}>
                  <select className={styles.filterSelect}>
                    <option>Monthly View</option>
                    <option>Quarterly View</option>
                    <option>Yearly View</option>
                  </select>
                </div>
              </div>
              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h3>Revenue Trend</h3>
                  <div className={styles.placeholderChart}>
                    <p>Revenue chart visualization would appear here</p>
                  </div>
                </div>
                <div className={styles.analyticsCard}>
                  <h3>Collection Performance</h3>
                  <div className={styles.placeholderChart}>
                    <p>Collection rate chart would appear here</p>
                  </div>
                </div>
                <div className={styles.analyticsCard}>
                  <h3>Payment Methods Distribution</h3>
                  <div className={styles.placeholderChart}>
                    <p>Payment methods pie chart would appear here</p>
                  </div>
                </div>
                <div className={styles.analyticsCard}>
                  <h3>Outstanding Balances Trend</h3>
                  <div className={styles.placeholderChart}>
                    <p>Balances over time chart would appear here</p>
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
