import React, { useState } from 'react';
import styles from './StudentFinancePage.module.css';

const StudentFinancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  // Mock data for student
  const studentData = {
    studentInfo: {
      name: 'John',
      id: 'STU-2024-789',
      program: 'Computer Science',
      semester: 'Spring 2024',
      status: 'Active'
    },
    financialOverview: {
      currentBalance: 12500.75,
      dueAmount: 3250.00,
      nextDueDate: '2024-03-15',
      financialHold: false,
      paymentPlan: 'Standard'
    },
    upcomingPayments: [
      { 
        id: 1, 
        description: 'Tuition Fee - Spring 2024', 
        amount: 2850.00, 
        dueDate: '2024-03-15',
        type: 'tuition',
        status: 'due'
      },
      { 
        id: 2, 
        description: 'Housing Fee - Spring 2024', 
        amount: 1200.00, 
        dueDate: '2024-04-01',
        type: 'housing',
        status: 'upcoming'
      },
      { 
        id: 3, 
        description: 'Meal Plan - Spring 2024', 
        amount: 850.00, 
        dueDate: '2024-04-01',
        type: 'meal',
        status: 'upcoming'
      }
    ],
    recentTransactions: [
      { 
        id: 1, 
        description: 'Tuition Payment', 
        amount: -2850.00, 
        date: '2024-02-15', 
        type: 'payment', 
        status: 'completed',
        receiptId: 'RCP-001'
      },
      { 
        id: 2, 
        description: 'Scholarship Credit', 
        amount: 1500.00, 
        date: '2024-02-10', 
        type: 'credit', 
        status: 'completed',
        receiptId: 'RCP-002'
      },
      { 
        id: 3, 
        description: 'Bookstore Purchase', 
        amount: -125.50, 
        date: '2024-02-08', 
        type: 'payment', 
        status: 'completed',
        receiptId: 'RCP-003'
      },
      { 
        id: 4, 
        description: 'Library Fine', 
        amount: -25.00, 
        date: '2024-02-05', 
        type: 'fine', 
        status: 'completed',
        receiptId: 'RCP-004'
      }
    ],
    paymentMethods: [
      { id: 1, type: 'card', lastFour: '4321', isDefault: true, cardType: 'Visa' },
      { id: 2, type: 'bank', lastFour: '8765', isDefault: false, bankName: 'Chase Bank' }
    ],
    receipts: [
      {
        id: 'RCP-001',
        transactionId: 'TXN-2847',
        date: '2024-02-15',
        time: '14:30',
        items: [
          { description: 'Tuition Spring 2024', amount: 2500.00 },
          { description: 'Student Services Fee', amount: 200.00 },
          { description: 'Technology Fee', amount: 150.00 }
        ],
        subtotal: 2850.00,
        tax: 0.00,
        total: 2850.00,
        paymentMethod: 'Visa •••• 4321',
        status: 'completed'
      },
      {
        id: 'RCP-002',
        transactionId: 'TXN-2848',
        date: '2024-02-10',
        time: '09:15',
        items: [
          { description: 'Academic Excellence Scholarship', amount: 1500.00 }
        ],
        subtotal: 1500.00,
        tax: 0.00,
        total: 1500.00,
        paymentMethod: 'Scholarship Credit',
        status: 'completed'
      }
    ],
    financialAid: {
      scholarships: [
        { name: 'Academic Excellence Scholarship', amount: 5000.00, status: 'Approved', term: 'Spring 2024' },
        { name: 'STEM Leadership Award', amount: 3000.00, status: 'Pending', term: 'Spring 2024' }
      ],
      loans: [
        { name: 'Federal Direct Loan', amount: 7500.00, status: 'Disbursed', term: 'Spring 2024' }
      ]
    },
    paymentPlan: {
      currentPlan: 'Standard',
      monthlyAmount: 1250.00,
      nextPaymentDate: '2024-03-15',
      remainingPayments: 10,
      totalRemaining: 12500.00
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReceiptById = (receiptId) => {
    return studentData.receipts.find(receipt => receipt.id === receiptId);
  };

  const handleMakePayment = (e) => {
    e.preventDefault();
    // Payment processing logic would go here
    alert(`Payment of ${formatCurrency(paymentAmount)} processed successfully!`);
    setPaymentAmount('');
    setSelectedPaymentMethod('');
  };

  const ReceiptModal = ({ receipt, onClose }) => {
    if (!receipt) return null;

    const handlePrint = () => {
      const receiptContent = document.getElementById('receipt-content');
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = receiptContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    };

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Payment Receipt</h2>
            <div className={styles.modalActions}>
              <button className={styles.downloadButton} onClick={handlePrint}>
                Print Receipt
              </button>
              <button className={styles.closeButton} onClick={onClose}>×</button>
            </div>
          </div>
          
          <div className={styles.receiptContainer}>
            <div id="receipt-content" className={styles.receipt}>
              <div className={styles.receiptHeader}>
                <div className={styles.receiptLogo}>
                  <div className={styles.logoIcon}>🏫</div>
                  <div>
                    <h3>University Finance System</h3>
                    <p>Student Payment Receipt</p>
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
                  <p><strong>Name:</strong> {studentData.studentInfo.name}</p>
                  <p><strong>Student ID:</strong> {studentData.studentInfo.id}</p>
                  <p><strong>Program:</strong> {studentData.studentInfo.program}</p>
                </div>
                <div className={styles.infoSection}>
                  <h4>Transaction Details</h4>
                  <p><strong>Date:</strong> {formatDate(receipt.date)}</p>
                  <p><strong>Time:</strong> {receipt.time}</p>
                  <p><strong>Transaction ID:</strong> {receipt.transactionId}</p>
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
                    <span className={item.amount < 0 ? styles.credit : styles.debit}>
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
                  <span><strong>Total Amount:</strong></span>
                  <span><strong>{formatCurrency(receipt.total)}</strong></span>
                </div>
              </div>

              <div className={styles.receiptFooter}>
                <div className={styles.paymentMethod}>
                  <p><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
                  <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>{receipt.status}</span></p>
                </div>
                <div className={styles.receiptStamp}>
                  <div className={styles.stamp}>PAID</div>
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
      <div className={styles.studentFinancePage}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>My Finance</h1>
              <p className={styles.subtitle}>Manage your student account and payments</p>
            </div>
            <div className={styles.studentInfo}>
              <div className={styles.studentBadge}>
                <span className={styles.studentName}>{studentData.studentInfo.name}</span>
                <span className={styles.studentId}>{studentData.studentInfo.id}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--emerald)' }}>
              💰
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Current Balance</h3>
              <p className={styles.statValue}>{formatCurrency(studentData.financialOverview.currentBalance)}</p>
              <p className={styles.statTrend}>
                {studentData.financialOverview.financialHold ? (
                  <span style={{ color: 'var(--ruby)' }}>Financial Hold Active</span>
                ) : (
                  <span style={{ color: 'var(--emerald)' }}>Account in Good Standing</span>
                )}
              </p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--ruby)' }}>
              ⚠️
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Amount Due</h3>
              <p className={styles.statValue}>{formatCurrency(studentData.financialOverview.dueAmount)}</p>
              <p className={styles.statTrend}>Due {formatDate(studentData.financialOverview.nextDueDate)}</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--sky)' }}>
              📅
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Next Due Date</h3>
              <p className={styles.statValue}>{formatDate(studentData.financialOverview.nextDueDate)}</p>
              <p className={styles.statTrend}>{studentData.financialOverview.paymentPlan} Plan</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--gold)' }}>
              ✅
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Payment Status</h3>
              <p className={styles.statValue}>
                {studentData.financialOverview.dueAmount > 0 ? 'Payment Due' : 'Paid in Full'}
              </p>
              <p className={styles.statTrend}>
                {studentData.upcomingPayments.filter(p => p.status === 'due').length} payments due
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
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
            💳 Make Payment
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Transaction History
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'receipts' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            🧾 Receipts
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'financialaid' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('financialaid')}
          >
            🎓 Financial Aid
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'paymentplan' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('paymentplan')}
          >
            📅 Payment Plan
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>
              {/* Upcoming Payments */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Upcoming Payments</h2>
                  <button className={styles.viewAllButton}>View All</button>
                </div>
                <div className={styles.paymentList}>
                  {studentData.upcomingPayments.map(payment => (
                    <div key={payment.id} className={styles.paymentItem}>
                      <div className={styles.paymentIcon}>
                        {payment.type === 'tuition' ? '🎓' : 
                         payment.type === 'housing' ? '🏠' : 
                         payment.type === 'meal' ? '🍽️' : '💰'}
                      </div>
                      <div className={styles.paymentInfo}>
                        <h4 className={styles.paymentDescription}>{payment.description}</h4>
                        <p className={styles.paymentDueDate}>
                          Due {formatDate(payment.dueDate)}
                          {payment.status === 'due' && (
                            <span className={styles.dueBadge}>Due Soon</span>
                          )}
                        </p>
                      </div>
                      <div className={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </div>
                      <button className={styles.payNowButton}>
                        Pay Now
                      </button>
                    </div>
                  ))}
                </div>
                <button className={styles.primaryButton}>Pay All Due Amounts</button>
              </div>

              {/* Recent Transactions */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Transactions</h2>
                  <button className={styles.viewAllButton}>View All</button>
                </div>
                <div className={styles.transactionList}>
                  {studentData.recentTransactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionIcon}>
                        {transaction.type === 'payment' ? '↗️' : 
                         transaction.type === 'credit' ? '↙️' : 
                         transaction.type === 'fine' ? '⚖️' : '💰'}
                      </div>
                      <div className={styles.transactionInfo}>
                        <h4 className={styles.transactionDescription}>
                          {transaction.description}
                        </h4>
                        <p className={styles.transactionDate}>
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className={`${styles.transactionAmount} ${
                        transaction.amount > 0 ? styles.credit : styles.debit
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </div>
                      <button 
                        className={styles.receiptButton}
                        onClick={() => setSelectedReceipt(getReceiptById(transaction.receiptId))}
                        title="View Receipt"
                      >
                        🧾
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Aid Summary */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Financial Aid Summary</h2>
                  <button className={styles.viewAllButton}>Details</button>
                </div>
                <div className={styles.aidSummary}>
                  <div className={styles.aidItem}>
                    <span className={styles.aidLabel}>Scholarships</span>
                    <span className={styles.aidAmount}>
                      {formatCurrency(studentData.financialAid.scholarships.reduce((sum, s) => sum + s.amount, 0))}
                    </span>
                  </div>
                  <div className={styles.aidItem}>
                    <span className={styles.aidLabel}>Loans</span>
                    <span className={styles.aidAmount}>
                      {formatCurrency(studentData.financialAid.loans.reduce((sum, l) => sum + l.amount, 0))}
                    </span>
                  </div>
                  <div className={styles.aidItem}>
                    <span className={styles.aidLabel}>Total Aid</span>
                    <span className={styles.aidTotal}>
                      {formatCurrency(
                        studentData.financialAid.scholarships.reduce((sum, s) => sum + s.amount, 0) +
                        studentData.financialAid.loans.reduce((sum, l) => sum + l.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Plan Summary */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Payment Plan</h2>
                  <button className={styles.viewAllButton}>Manage</button>
                </div>
                <div className={styles.planSummary}>
                  <div className={styles.planItem}>
                    <span className={styles.planLabel}>Current Plan</span>
                    <span className={styles.planValue}>{studentData.paymentPlan.currentPlan}</span>
                  </div>
                  <div className={styles.planItem}>
                    <span className={styles.planLabel}>Monthly Payment</span>
                    <span className={styles.planValue}>{formatCurrency(studentData.paymentPlan.monthlyAmount)}</span>
                  </div>
                  <div className={styles.planItem}>
                    <span className={styles.planLabel}>Next Payment</span>
                    <span className={styles.planValue}>{formatDate(studentData.paymentPlan.nextPaymentDate)}</span>
                  </div>
                  <div className={styles.planItem}>
                    <span className={styles.planLabel}>Remaining</span>
                    <span className={styles.planValue}>{studentData.paymentPlan.remainingPayments} payments</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className={styles.paymentSection}>
              <div className={styles.paymentLayout}>
                {/* Make Payment Form */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Make a Payment</h2>
                  <form onSubmit={handleMakePayment} className={styles.paymentForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Payment Amount</label>
                      <div className={styles.amountInputContainer}>
                        <span className={styles.currencySymbol}>$</span>
                        <input 
                          type="number" 
                          className={styles.formInput}
                          placeholder="0.00"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Payment Method</label>
                      <select 
                        className={styles.formSelect}
                        value={selectedPaymentMethod}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        required
                      >
                        <option value="">Select payment method...</option>
                        {studentData.paymentMethods.map(method => (
                          <option key={method.id} value={method.id}>
                            {method.type === 'card' ? `${method.cardType} •••• ${method.lastFour}` : 
                             `${method.bankName} •••• ${method.lastFour}`}
                            {method.isDefault && ' (Default)'}
                          </option>
                        ))}
                        <option value="new">+ Add New Payment Method</option>
                      </select>
                    </div>

                    <div className={styles.paymentSummary}>
                      <div className={styles.summaryItem}>
                        <span>Payment Amount:</span>
                        <span>{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                      </div>
                      <div className={styles.summaryItem}>
                        <span>Processing Fee:</span>
                        <span>{formatCurrency(0)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>Total:</span>
                        <span>{formatCurrency(parseFloat(paymentAmount) || 0)}</span>
                      </div>
                    </div>
                    
                    <button type="submit" className={styles.primaryButton}>
                      Process Payment
                    </button>
                  </form>
                </div>

                {/* Quick Payment Options */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Quick Pay</h2>
                  <div className={styles.quickPayOptions}>
                    {studentData.upcomingPayments.filter(p => p.status === 'due').map(payment => (
                      <button 
                        key={payment.id}
                        className={styles.quickPayButton}
                        onClick={() => setPaymentAmount(payment.amount.toString())}
                      >
                        <span className={styles.quickPayDescription}>{payment.description}</span>
                        <span className={styles.quickPayAmount}>{formatCurrency(payment.amount)}</span>
                      </button>
                    ))}
                    <button 
                      className={styles.quickPayButton}
                      onClick={() => setPaymentAmount(studentData.financialOverview.dueAmount.toString())}
                    >
                      <span className={styles.quickPayDescription}>Pay Total Due</span>
                      <span className={styles.quickPayAmount}>{formatCurrency(studentData.financialOverview.dueAmount)}</span>
                    </button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Payment Methods</h2>
                    <button className={styles.secondaryButton}>Add New</button>
                  </div>
                  <div className={styles.paymentMethodsList}>
                    {studentData.paymentMethods.map(method => (
                      <div key={method.id} className={styles.paymentMethodCard}>
                        <div className={styles.methodIcon}>
                          {method.type === 'card' ? '💳' : '🏦'}
                        </div>
                        <div className={styles.methodInfo}>
                          <h4 className={styles.methodType}>
                            {method.type === 'card' ? `${method.cardType} Card` : method.bankName}
                          </h4>
                          <p className={styles.methodDetails}>
                            •••• {method.lastFour}
                          </p>
                        </div>
                        <div className={styles.methodActions}>
                          {method.isDefault && (
                            <span className={styles.defaultBadge}>Default</span>
                          )}
                          <button className={styles.editButton}>Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.historySection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Transaction History</h2>
                <div className={styles.historyFilters}>
                  <select className={styles.filterSelect}>
                    <option>All Transactions</option>
                    <option>Payments Only</option>
                    <option>Credits Only</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
              </div>
              <div className={styles.historyTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.tableCell}>Description</div>
                  <div className={styles.tableCell}>Date</div>
                  <div className={styles.tableCell}>Amount</div>
                  <div className={styles.tableCell}>Status</div>
                  <div className={styles.tableCell}>Receipt</div>
                </div>
                {studentData.recentTransactions.map(transaction => (
                  <div key={transaction.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>{transaction.description}</div>
                    <div className={styles.tableCell}>{formatDate(transaction.date)}</div>
                    <div className={`${styles.tableCell} ${
                      transaction.amount > 0 ? styles.credit : styles.debit
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.statusBadge}>{transaction.status}</span>
                    </div>
                    <div className={styles.tableCell}>
                      <button 
                        className={styles.receiptLink}
                        onClick={() => setSelectedReceipt(getReceiptById(transaction.receiptId))}
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'receipts' && (
            <div className={styles.receiptsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Payment Receipts</h2>
                <div className={styles.receiptFilters}>
                  <select className={styles.filterSelect}>
                    <option>All Receipts</option>
                    <option>This Semester</option>
                    <option>Last 3 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.receiptsGrid}>
                {studentData.receipts.map(receipt => (
                  <div key={receipt.id} className={styles.receiptCard}>
                    <div className={styles.receiptCardHeader}>
                      <div className={styles.receiptCardId}>{receipt.id}</div>
                      <div className={styles.receiptCardStatus}>
                        <span className={styles.statusBadge}>{receipt.status}</span>
                      </div>
                    </div>
                    
                    <div className={styles.receiptCardBody}>
                      <div className={styles.receiptCardDate}>
                        {formatDate(receipt.date)} at {receipt.time}
                      </div>
                      <div className={`${styles.receiptCardAmount} ${
                        receipt.total < 0 ? styles.credit : styles.debit
                      }`}>
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

          {activeTab === 'financialaid' && (
            <div className={styles.financialAidSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Financial Aid</h2>
                <button className={styles.primaryButton}>Apply for Aid</button>
              </div>

              <div className={styles.aidLayout}>
                {/* Scholarships */}
                <div className={styles.section}>
                  <h3 className={styles.sectionSubtitle}>Scholarships</h3>
                  <div className={styles.aidList}>
                    {studentData.financialAid.scholarships.map((scholarship, index) => (
                      <div key={index} className={styles.aidItemDetailed}>
                        <div className={styles.aidInfo}>
                          <h4 className={styles.aidName}>{scholarship.name}</h4>
                          <p className={styles.aidTerm}>{scholarship.term}</p>
                        </div>
                        <div className={styles.aidAmountDetailed}>
                          {formatCurrency(scholarship.amount)}
                        </div>
                        <div className={styles.aidStatus}>
                          <span className={`${styles.statusBadge} ${
                            scholarship.status === 'Approved' ? styles.statusApproved : 
                            scholarship.status === 'Pending' ? styles.statusPending : 
                            styles.statusDenied
                          }`}>
                            {scholarship.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Loans */}
                <div className={styles.section}>
                  <h3 className={styles.sectionSubtitle}>Loans</h3>
                  <div className={styles.aidList}>
                    {studentData.financialAid.loans.map((loan, index) => (
                      <div key={index} className={styles.aidItemDetailed}>
                        <div className={styles.aidInfo}>
                          <h4 className={styles.aidName}>{loan.name}</h4>
                          <p className={styles.aidTerm}>{loan.term}</p>
                        </div>
                        <div className={styles.aidAmountDetailed}>
                          {formatCurrency(loan.amount)}
                        </div>
                        <div className={styles.aidStatus}>
                          <span className={styles.statusBadge}>{loan.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aid Summary */}
                <div className={styles.section}>
                  <h3 className={styles.sectionSubtitle}>Aid Summary</h3>
                  <div className={styles.aidSummaryDetailed}>
                    <div className={styles.summaryItem}>
                      <span>Total Scholarships:</span>
                      <span>{formatCurrency(studentData.financialAid.scholarships.reduce((sum, s) => sum + s.amount, 0))}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span>Total Loans:</span>
                      <span>{formatCurrency(studentData.financialAid.loans.reduce((sum, l) => sum + l.amount, 0))}</span>
                    </div>
                    <div className={styles.summaryTotal}>
                      <span>Total Financial Aid:</span>
                      <span>{formatCurrency(
                        studentData.financialAid.scholarships.reduce((sum, s) => sum + s.amount, 0) +
                        studentData.financialAid.loans.reduce((sum, l) => sum + l.amount, 0)
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paymentplan' && (
            <div className={styles.paymentPlanSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Payment Plan</h2>
                <button className={styles.primaryButton}>Change Plan</button>
              </div>

              <div className={styles.planDetails}>
                <div className={styles.planOverview}>
                  <div className={styles.planCard}>
                    <h3 className={styles.planName}>{studentData.paymentPlan.currentPlan} Plan</h3>
                    <div className={styles.planStats}>
                      <div className={styles.planStat}>
                        <span className={styles.planStatLabel}>Monthly Payment</span>
                        <span className={styles.planStatValue}>{formatCurrency(studentData.paymentPlan.monthlyAmount)}</span>
                      </div>
                      <div className={styles.planStat}>
                        <span className={styles.planStatLabel}>Next Payment Date</span>
                        <span className={styles.planStatValue}>{formatDate(studentData.paymentPlan.nextPaymentDate)}</span>
                      </div>
                      <div className={styles.planStat}>
                        <span className={styles.planStatLabel}>Remaining Payments</span>
                        <span className={styles.planStatValue}>{studentData.paymentPlan.remainingPayments}</span>
                      </div>
                      <div className={styles.planStat}>
                        <span className={styles.planStatLabel}>Total Remaining</span>
                        <span className={styles.planStatValue}>{formatCurrency(studentData.paymentPlan.totalRemaining)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3 className={styles.sectionSubtitle}>Upcoming Payments</h3>
                  <div className={styles.paymentSchedule}>
                    {studentData.upcomingPayments.map((payment, index) => (
                      <div key={payment.id} className={styles.scheduleItem}>
                        <div className={styles.scheduleDate}>
                          {formatDate(payment.dueDate)}
                        </div>
                        <div className={styles.scheduleDescription}>
                          {payment.description}
                        </div>
                        <div className={styles.scheduleAmount}>
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className={styles.scheduleStatus}>
                          <span className={`${styles.statusBadge} ${
                            payment.status === 'due' ? styles.statusDue : styles.statusUpcoming
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        <ReceiptModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      </div>
    </div>
  );
};

export default StudentFinancePage;