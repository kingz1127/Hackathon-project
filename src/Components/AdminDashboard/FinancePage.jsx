import React, { useState } from 'react';
import styles from './FinancePage.module.css';

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  // Mock data - in real app, this would come from API
  const financialData = {
    totalRevenue: 125000.75,
    pendingPayments: 32500.00,
    collectedThisMonth: 45000.50,
    outstandingBalance: 89500.25,
    revenueTrend: 12.5,
    collectionRate: 78.3,
    
    paymentDistribution: [
      { category: 'Tuition', amount: 85000, percentage: 68, color: 'var(--sapphire)' },
      { category: 'Housing', amount: 25000, percentage: 20, color: 'var(--emerald)' },
      { category: 'Meal Plans', amount: 12000, percentage: 9.6, color: 'var(--gold)' },
      { category: 'Other Fees', amount: 3000, percentage: 2.4, color: 'var(--ruby)' }
    ],
    
    recentTransactions: [
      { id: 1, student: 'Alex Johnson', description: 'Tuition Payment', amount: 2850.00, date: '2024-02-15', type: 'payment', status: 'completed', receiptId: 'RCP-001' },
      { id: 2, student: 'Sarah Chen', description: 'Scholarship Credit', amount: -1500.00, date: '2024-02-14', type: 'credit', status: 'completed', receiptId: 'RCP-002' },
      { id: 3, student: 'Mike Rodriguez', description: 'Housing Fee', amount: 1200.00, date: '2024-02-14', type: 'payment', status: 'completed', receiptId: 'RCP-003' },
      { id: 4, student: 'Emily Davis', description: 'Late Fee', amount: 50.00, date: '2024-02-13', type: 'payment', status: 'completed', receiptId: 'RCP-004' },
      { id: 5, student: 'James Wilson', description: 'Meal Plan Top-up', amount: 300.00, date: '2024-02-12', type: 'payment', status: 'pending', receiptId: 'RCP-005' }
    ],
    
    topStudents: [
      { name: 'Alex Johnson', id: 'STU-2024-001', balance: 2850.00, status: 'Overdue' },
      { name: 'Maria Garcia', id: 'STU-2024-002', balance: 2200.00, status: 'Due Soon' },
      { name: 'David Kim', id: 'STU-2024-003', balance: 1850.00, status: 'Due Soon' },
      { name: 'Lisa Thompson', id: 'STU-2024-004', balance: 1500.00, status: 'Current' }
    ],
    
    receipts: [
      {
        id: 'RCP-001',
        transactionId: 'TXN-2847',
        date: '2024-02-15',
        time: '14:30',
        student: 'Alex Johnson',
        studentId: 'STU-2024-001',
        items: [
          { description: 'Tuition Spring 2024', amount: 2500.00 },
          { description: 'Student Services Fee', amount: 200.00 },
          { description: 'Technology Fee', amount: 150.00 }
        ],
        subtotal: 2850.00,
        tax: 0.00,
        total: 2850.00,
        paymentMethod: 'Credit Card',
        status: 'completed'
      },
      {
        id: 'RCP-002',
        transactionId: 'TXN-2848',
        date: '2024-02-14',
        time: '09:15',
        student: 'Sarah Chen',
        studentId: 'STU-2024-005',
        items: [
          { description: 'Academic Excellence Scholarship', amount: -1500.00 }
        ],
        subtotal: -1500.00,
        tax: 0.00,
        total: -1500.00,
        paymentMethod: 'Scholarship',
        status: 'completed'
      },
      {
        id: 'RCP-003',
        transactionId: 'TXN-2849',
        date: '2024-02-14',
        time: '11:20',
        student: 'Mike Rodriguez',
        studentId: 'STU-2024-003',
        items: [
          { description: 'Housing Fee - Spring 2024', amount: 1200.00 }
        ],
        subtotal: 1200.00,
        tax: 0.00,
        total: 1200.00,
        paymentMethod: 'Bank Transfer',
        status: 'completed'
      },
      {
        id: 'RCP-004',
        transactionId: 'TXN-2850',
        date: '2024-02-13',
        time: '16:45',
        student: 'Emily Davis',
        studentId: 'STU-2024-004',
        items: [
          { description: 'Late Payment Fee', amount: 50.00 }
        ],
        subtotal: 50.00,
        tax: 0.00,
        total: 50.00,
        paymentMethod: 'Credit Card',
        status: 'completed'
      }
    ]
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
    return financialData.receipts.find(receipt => receipt.id === receiptId);
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
                  <p><strong>Name:</strong> {receipt.student}</p>
                  <p><strong>Student ID:</strong> {receipt.studentId}</p>
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
      <div className={styles.financePage}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Finance Administration Dashboard</h1>
              <p className={styles.subtitle}>financial activities and transactions</p>
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
              <button className={styles.exportButton}>
                📊 Export Report
              </button>
            </div>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--emerald)' }}>
              💰
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Total Revenue</h3>
              <p className={styles.statValue}>{formatCurrency(financialData.totalRevenue)}</p>
              <p className={styles.statTrend}>
                <span style={{ color: 'var(--emerald)' }}>↑ {financialData.revenueTrend}%</span> from last month
              </p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--ruby)' }}>
              ⚠️
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Pending Payments</h3>
              <p className={styles.statValue}>{formatCurrency(financialData.pendingPayments)}</p>
              <p className={styles.statTrend}>{financialData.topStudents.length} students with balances</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--sky)' }}>
              📈
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Collected This Month</h3>
              <p className={styles.statValue}>{formatCurrency(financialData.collectedThisMonth)}</p>
              <p className={styles.statTrend}>{financialData.collectionRate}% collection rate</p>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: 'var(--gold)' }}>
              ⚖️
            </div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Outstanding Balance</h3>
              <p className={styles.statValue}>{formatCurrency(financialData.outstandingBalance)}</p>
              <p className={styles.statTrend}>Across all student accounts</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'transactions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            💳 Transactions
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'receipts' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            🧾 Receipts
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>
              {/* Payment Distribution Chart */}
              <div className={`${styles.section} ${styles.chartSection}`}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Revenue Distribution by Category</h2>
                  <span className={styles.sectionSubtitle}>Current fiscal period</span>
                </div>
                <div className={styles.distributionChart}>
                  {financialData.paymentDistribution.map((item, index) => (
                    <div key={item.category} className={styles.chartItem}>
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
                </div>
              </div>

              {/* Top Students with Outstanding Balances */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Top Outstanding Balances</h2>
                  <button className={styles.viewAllButton}>View All Students</button>
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
                      <div className={`${styles.statusBadge} ${
                        student.status === 'Overdue' ? styles.statusOverdue : 
                        student.status === 'Due Soon' ? styles.statusDueSoon : 
                        styles.statusCurrent
                      }`}>
                        {student.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Recent Transactions</h2>
                  <button className={styles.viewAllButton}>View All Transactions</button>
                </div>
                <div className={styles.transactionList}>
                  {financialData.recentTransactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className={styles.transactionItem}>
                      <div className={styles.transactionIcon}>
                        {transaction.type === 'payment' ? '↗️' : '↙️'}
                      </div>
                      <div className={styles.transactionInfo}>
                        <h4 className={styles.transactionDescription}>
                          {transaction.description}
                        </h4>
                        <p className={styles.transactionStudent}>
                          {transaction.student} • {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div className={`${styles.transactionAmount} ${
                        transaction.amount > 0 ? styles.debit : styles.credit
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
            </div>
          )}

          {activeTab === 'receipts' && (
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
                {financialData.receipts.map(receipt => (
                  <div key={receipt.id} className={styles.receiptCard}>
                    <div className={styles.receiptCardHeader}>
                      <div className={styles.receiptCardId}>{receipt.id}</div>
                      <div className={styles.receiptCardStatus}>
                        <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>{receipt.status}</span>
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

          {activeTab === 'transactions' && (
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
                {financialData.recentTransactions.map(transaction => (
                  <div key={transaction.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <div>
                        <div className={styles.studentName}>{transaction.student}</div>
                        <div className={styles.studentId}>ID: {transaction.id}</div>
                      </div>
                    </div>
                    <div className={styles.tableCell}>{transaction.description}</div>
                    <div className={styles.tableCell}>{formatDate(transaction.date)}</div>
                    <div className={`${styles.tableCell} ${
                      transaction.amount > 0 ? styles.debit : styles.credit
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                    <div className={styles.tableCell}>
                      <span className={`${styles.statusBadge} ${
                        transaction.status === 'completed' ? styles.statusCompleted : styles.statusPending
                      }`}>
                        {transaction.status}
                      </span>
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

          {activeTab === 'analytics' && (
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

        {/* Receipt Modal */}
        <ReceiptModal 
          receipt={selectedReceipt} 
          onClose={() => setSelectedReceipt(null)} 
        />
      </div>
    </div>
  );
};

export default FinancePage;