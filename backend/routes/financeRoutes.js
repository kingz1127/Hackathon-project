// Enhanced financeRoutes.js with proper database operations and receipts

import express from 'express';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import Student from '../models/Student.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many payment attempts, please try again later'
});

// ✅ Get all students for admin with real payment data
// In financeRoutes.js - UPDATED VERSION
router.get('/admin/students', async (req, res) => {
  try {
    console.log('Fetching all students for admin...');
    
    const students = await Student.find({ isActive: true })
      .select('studentId fullName email course gradeLevel')
      .lean();

    const studentsWithPayments = await Promise.all(
      students.map(async (student) => {
        const payments = await Payment.find({ studentId: student.studentId });
        
        // Calculate ONLY from payments, ignore student.accountBalance
        const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const amountPaid = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
        
        return {
          id: student.studentId,
          name: student.fullName,
          email: student.email,
          course: student.course,
          gradeLevel: student.gradeLevel,
          totalAmount: totalAmount, // ONLY from payments
          amountPaid: amountPaid,   // ONLY from payments
          description: 'Tuition and Fees',
          payments: payments
        };
      })
    );

    console.log(`Found ${studentsWithPayments.length} students with payments`);
    res.json(studentsWithPayments);
  } catch (error) {
    console.error('Error fetching students for admin:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// ✅ Set payment for student with proper database saving
// ✅ Set payment for student - COMPLETE VERSION
router.post('/admin/set-payment', async (req, res) => {
  try {
    const { studentId, studentName, amount, description, dueDate, type } = req.body;
    
    console.log('Setting payment for student:', { studentId, studentName, amount, description, dueDate, type });

    // Validate input
    if (!studentId || !studentName || !amount || !description || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create new payment
    const payment = new Payment({
      studentId,
      studentName,
      amount: parseFloat(amount),
      amountPaid: 0,
      description,
      dueDate: new Date(dueDate),
      type: type || 'tuition',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await payment.save();

    // Update student's account balance (this is what shows in overview)
    student.accountBalance = (student.accountBalance || 0) + parseFloat(amount);
    student.lastUpdated = new Date();
    await student.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      studentId,
      studentName,
      description: `Payment assigned: ${description}`,
      amount: parseFloat(amount),
      type: 'payment',
      status: 'pending',
      date: new Date(),
      paymentId: payment._id,
      balanceBefore: (student.accountBalance || 0) - parseFloat(amount),
      balanceAfter: student.accountBalance
    });

    await transaction.save();

    console.log('Payment set successfully for student:', studentId);
    res.json({ 
      message: 'Payment successfully set for student', 
      payment,
      transaction
    });
  } catch (error) {
    console.error('Error setting payment:', error);
    res.status(500).json({ message: 'Failed to set payment', error: error.message });
  }
});

// ✅ Edit payment with proper updates
router.put('/admin/edit-payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amountPaid, totalAmount, status, description } = req.body;
    
    console.log('Editing payment:', { paymentId, amountPaid, totalAmount, status, description });

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const oldAmountPaid = payment.amountPaid || 0;
    const newAmountPaid = parseFloat(amountPaid) || 0;
    const newTotalAmount = parseFloat(totalAmount) || payment.amount;

    // Update payment
    payment.amountPaid = newAmountPaid;
    payment.amount = newTotalAmount;
    payment.status = status || payment.status;
    payment.description = description || payment.description;
    payment.updatedAt = new Date();

    await payment.save();

    // Update student's account balance based on payments
    const student = await Student.findOne({ studentId: payment.studentId });
    if (student) {
      // Recalculate balance from all payments
      const allPayments = await Payment.find({ studentId: payment.studentId });
      const totalDue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalPaid = allPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
      
      student.accountBalance = totalDue - totalPaid;
      student.lastUpdated = new Date();
      await student.save();

      // Create transaction if payment was made
      if (newAmountPaid > oldAmountPaid) {
        const transaction = new Transaction({
          transactionId: `TXN${Date.now()}`,
          studentId: payment.studentId,
          studentName: payment.studentName,
          description: `Payment received: ${payment.description}`,
          amount: newAmountPaid - oldAmountPaid,
          type: 'payment',
          status: 'completed',
          date: new Date(),
          paymentId: payment._id,
          balanceBefore: student.accountBalance + (newAmountPaid - oldAmountPaid),
          balanceAfter: student.accountBalance
        });
        await transaction.save();
      }
    }

    console.log('Payment updated successfully:', paymentId);
    res.json({ 
      message: 'Payment successfully updated', 
      payment 
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Failed to update payment', error: error.message });
  }
});

// ✅ Generate receipt function (update if needed)
const generateReceipt = async (payment, amountPaid, paymentMethod = 'Online') => {
  try {
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const receipt = new Receipt({
      receiptNumber,
      studentId: payment.studentId,
      studentName: payment.studentName,
      paymentId: payment._id,
      amount: amountPaid,
      description: payment.description,
      paymentMethod: paymentMethod,
      status: 'completed',
      date: new Date(),
      items: [{
        description: payment.description,
        amount: amountPaid,
        type: payment.type
      }],
      subtotal: amountPaid,
      tax: 0,
      total: amountPaid
    });

    await receipt.save();
    console.log('Receipt generated:', receiptNumber);
    return receipt;
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw error;
  }
};

// ✅ Generate receipts for existing payments
router.post('/admin/generate-missing-receipts', async (req, res) => {
  try {
    console.log('Generating missing receipts for existing payments...');
    
    // Find payments that don't have receipts yet
    const payments = await Payment.find({ 
      $or: [
        { amountPaid: { $gt: 0 } },
        { status: 'completed' }
      ]
    });
    
    console.log(`Found ${payments.length} payments to generate receipts for`);
    
    const generatedReceipts = [];
    
    for (const payment of payments) {
      // Check if receipt already exists for this payment
      const existingReceipt = await Receipt.findOne({ paymentId: payment._id });
      
      if (!existingReceipt) {
        // Generate receipt
        const receipt = await generateReceipt(
          payment, 
          payment.amountPaid || payment.amount,
          'System Generated'
        );
        
        generatedReceipts.push(receipt);
        console.log(`Generated receipt for payment: ${payment.description}`);
      }
    }
    
    res.json({
      message: `Successfully generated ${generatedReceipts.length} receipts`,
      generatedReceipts: generatedReceipts.length,
      totalPayments: payments.length
    });
    
  } catch (error) {
    console.error('Error generating missing receipts:', error);
    res.status(500).json({ 
      message: 'Failed to generate receipts', 
      error: error.message 
    });
  }
});

// ✅ Get payment details for a specific payment
router.get('/admin/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
  }
});

// ✅ Get all payments for admin
router.get('/admin/payments', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// ✅ Generate and send receipt to student
router.post('/admin/generate-receipt/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const receipt = await generateReceipt(payment, payment.amountPaid || payment.amount);
    
    res.json({
      message: 'Receipt generated successfully',
      receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Failed to generate receipt', error: error.message });
  }
});

/// ✅ Get financial overview for admin - FIXED VERSION
router.get('/admin/overview', async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    const payments = await Payment.find();
    const transactions = await Transaction.find().sort({ date: -1 }).limit(10);
    const receipts = await Receipt.find().sort({ date: -1 }).limit(8); // ✅ ADD RECEIPTS

    // Calculate financial metrics from ACTUAL payments
    const totalRevenue = payments
      .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);

    const pendingPayments = payments
      .filter(p => p.status === 'pending' || p.status === 'due')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const collectedThisMonth = payments
      .filter(p => p.amountPaid > 0 && 
        new Date(p.updatedAt).getMonth() === new Date().getMonth())
      .reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);

    // ✅ FIX: Calculate outstanding balance from payments, not student.accountBalance
    const outstandingBalance = payments.reduce((sum, payment) => {
      return sum + (payment.amount || 0) - (payment.amountPaid || 0);
    }, 0);

    // Payment distribution by type
    const paymentDistribution = [
      { category: 'Tuition', amount: 0, percentage: 0, color: '#3b82f6' },
      { category: 'Housing', amount: 0, percentage: 0, color: '#ef4444' },
      { category: 'Meal Plan', amount: 0, percentage: 0, color: '#10b981' },
      { category: 'Fees', amount: 0, percentage: 0, color: '#f59e0b' }
    ];

    payments.forEach(payment => {
      const categoryIndex = paymentDistribution.findIndex(item => 
        item.category.toLowerCase() === (payment.type || 'tuition')?.toLowerCase()
      );
      if (categoryIndex !== -1) {
        paymentDistribution[categoryIndex].amount += payment.amount || 0;
      }
    });

    // Calculate percentages
    const totalAmount = paymentDistribution.reduce((sum, item) => sum + item.amount, 0);
    paymentDistribution.forEach(item => {
      item.percentage = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;
    });

    // ✅ FIX: Top students with balances calculated from payments
    const studentBalances = await Promise.all(
      students.map(async (student) => {
        const studentPayments = await Payment.find({ studentId: student.studentId });
        const balance = studentPayments.reduce((sum, payment) => {
          return sum + (payment.amount || 0) - (payment.amountPaid || 0);
        }, 0);
        
        return {
          id: student.studentId,
          name: student.fullName,
          balance: balance,
          status: balance > 1000 ? 'Overdue' : balance > 0 ? 'Due Soon' : 'Paid'
        };
      })
    );

    const topStudents = studentBalances
      .filter(student => student.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    const overviewData = {
      totalRevenue,
      revenueTrend: totalRevenue > 0 ? 12.5 : 0,
      pendingPayments,
      collectedThisMonth,
      outstandingBalance, // Now calculated from payments
      collectionRate: totalRevenue > 0 ? Math.round((totalRevenue / (totalRevenue + outstandingBalance)) * 100) : 0,
      paymentDistribution: paymentDistribution.filter(item => item.amount > 0),
      topStudents,
      recentTransactions: transactions.map(transaction => ({
        id: transaction._id,
        student: transaction.studentName,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        type: transaction.type,
        status: transaction.status
      })),
      // ✅ UPDATE: Include actual receipts with proper data
      receipts: receipts.map(receipt => ({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        student: receipt.studentName,
        studentId: receipt.studentId,
        date: receipt.date,
        time: receipt.date.toLocaleTimeString(),
        total: receipt.total,
        status: receipt.status,
        paymentMethod: receipt.paymentMethod,
        items: receipt.items || []
      }))
    };

    res.json(overviewData);
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ message: 'Failed to fetch overview', error: error.message });
  }
});

// ✅ Get all receipts with filtering
router.get('/admin/receipts', async (req, res) => {
  try {
    const { period, search } = req.query;
    
    console.log('Fetching receipts with filters:', { period, search });
    
    let query = {};
    
    // Date filtering based on period
    if (period) {
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          // All receipts
          break;
      }
      
      if (startDate) {
        query.date = { $gte: startDate };
      }
    }
    
    // Search filtering
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const receipts = await Receipt.find(query)
      .sort({ date: -1 })
      .limit(50);
    
    console.log(`Found ${receipts.length} receipts`);
    
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt._id,
      receiptNumber: receipt.receiptNumber,
      student: receipt.studentName,
      studentId: receipt.studentId,
      date: receipt.date,
      time: receipt.date.toLocaleTimeString(),
      total: receipt.total,
      status: receipt.status,
      paymentMethod: receipt.paymentMethod,
      items: receipt.items || []
    }));
    
    res.json({
      success: true,
      receipts: formattedReceipts,
      total: receipts.length
    });
    
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch receipts', 
      error: error.message 
    });
  }
});

// ✅ Get student financial overview - UPDATED
router.get('/student/:studentId/overview', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`Fetching financial overview for student: ${studentId}`);

    // Check if student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student's payments
    const payments = await Payment.find({ studentId });
    
    // Get recent transactions for this student (only if they exist)
    const recentTransactions = await Transaction.find({ studentId })
      .sort({ date: -1 })
      .limit(10)
      .select('description amount date status type');

    // Only include transactions that have actual payment data
    const validRecentTransactions = recentTransactions.filter(transaction => {
      // Filter out transactions that don't have corresponding payments
      return transaction.amount > 0;
    });

    // Get upcoming due payments (only valid ones)
    const upcomingPayments = payments
      .filter(payment => 
        (payment.status === 'pending' || payment.status === 'due' || payment.status === 'partial') &&
        payment.amount > 0
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Calculate financial metrics
    const totalDue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const amountPaid = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const amountRemaining = totalDue - amountPaid;

    // Calculate payment distribution (only if there are payments)
    const paymentDistribution = [
      { category: 'Tuition', amount: 0, percentage: 0, color: '#3b82f6' },
      { category: 'Housing', amount: 0, percentage: 0, color: '#ef4444' },
      { category: 'Meal Plan', amount: 0, percentage: 0, color: '#10b981' },
      { category: 'Fees', amount: 0, percentage: 0, color: '#f59e0b' }
    ];

    payments.forEach(payment => {
      const categoryIndex = paymentDistribution.findIndex(item => 
        item.category.toLowerCase() === (payment.type || 'tuition')?.toLowerCase()
      );
      if (categoryIndex !== -1) {
        paymentDistribution[categoryIndex].amount += payment.amount || 0;
      }
    });

    // Filter out empty categories
    const filteredPaymentDistribution = paymentDistribution.filter(item => item.amount > 0);

    // Calculate percentages only if there's data
    const totalAmount = filteredPaymentDistribution.reduce((sum, item) => sum + item.amount, 0);
    filteredPaymentDistribution.forEach(item => {
      item.percentage = totalAmount > 0 ? Math.round((item.amount / totalAmount) * 100) : 0;
    });

    const studentOverview = {
      studentInfo: {
        id: student.studentId,
        name: student.fullName,
        email: student.email,
        course: student.course,
        gradeLevel: student.gradeLevel
      },
      financialSummary: {
        totalDue,
        amountPaid,
        amountRemaining,
        accountBalance: student.accountBalance || 0,
        paymentProgress: totalDue > 0 ? Math.round((amountPaid / totalDue) * 100) : 0
      },
      paymentDistribution: filteredPaymentDistribution,
      upcomingPayments: upcomingPayments,
      recentTransactions: validRecentTransactions, // Only valid transactions
      paymentHistory: payments.map(payment => ({
        id: payment._id,
        description: payment.description,
        totalAmount: payment.amount,
        amountPaid: payment.amountPaid,
        dueDate: payment.dueDate,
        status: payment.status,
        type: payment.type,
        createdAt: payment.createdAt
      }))
    };

    console.log(`Student overview fetched successfully for: ${studentId}`);
    res.json(studentOverview);
  } catch (error) {
    console.error('Error fetching student overview:', error);
    res.status(500).json({ 
      message: 'Failed to fetch student financial overview', 
      error: error.message 
    });
  }
});


// ✅ Get student payment history
router.get('/student/:studentId/payments', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`Fetching payments for student: ${studentId}`);

    // Validate student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Get payments for this student
    const payments = await Payment.find({ studentId }).sort({ dueDate: 1 });
    
    console.log(`Found ${payments.length} payments for student ${studentId}`);
    
    res.json({
      success: true,
      student: {
        id: student.studentId,
        name: student.fullName,
        email: student.email
      },
      payments: payments.map(payment => ({
        id: payment._id,
        studentId: payment.studentId,
        studentName: payment.studentName,
        amount: payment.amount,
        amountPaid: payment.amountPaid,
        totalAmount: payment.amount,
        description: payment.description,
        dueDate: payment.dueDate,
        type: payment.type,
        status: payment.status,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching student payments', 
      error: error.message 
    });
  }
});

// ✅ Get student receipts
router.get('/student/:studentId/receipts', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get receipts for this student
    const receipts = await Receipt.find({ studentId }).sort({ date: -1 });
    
    res.json({
      success: true,
      receipts: receipts.map(receipt => ({
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        amount: receipt.amount,
        description: receipt.description,
        date: receipt.date,
        status: receipt.status,
        items: receipt.items
      }))
    });
  } catch (error) {
    console.error('Error fetching student receipts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching student receipts', 
      error: error.message 
    });
  }
});

// ✅ Make payment (student paying their dues)
router.post('/student/:studentId/make-payment', paymentLimiter, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { paymentId, amount, paymentMethod } = req.body;

    console.log(`Processing payment for student ${studentId}:`, { paymentId, amount, paymentMethod });

    // Validate input
    if (!paymentId || !amount || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID, amount, and payment method are required' 
      });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment || payment.studentId !== studentId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    const paymentAmount = parseFloat(amount);
    const remainingBalance = payment.amount - payment.amountPaid;

    // Validate payment amount
    if (paymentAmount <= 0 || paymentAmount > remainingBalance) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid payment amount. Maximum allowed: ${remainingBalance}` 
      });
    }

    // Update payment
    payment.amountPaid += paymentAmount;
    
    // Update status based on payment
    if (payment.amountPaid >= payment.amount) {
      payment.status = 'completed';
    } else if (payment.amountPaid > 0) {
      payment.status = 'partial';
    }
    
    payment.updatedAt = new Date();
    await payment.save();

    // Update student balance
    const student = await Student.findOne({ studentId });
    if (student) {
      student.accountBalance = Math.max(0, (student.accountBalance || 0) - paymentAmount);
      student.lastUpdated = new Date();
      await student.save();
    }

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `TXN${Date.now()}`,
      studentId,
      studentName: student.fullName,
      description: `Payment made: ${payment.description}`,
      amount: paymentAmount,
      type: 'payment',
      status: 'completed',
      date: new Date(),
      paymentId: payment._id,
      paymentMethod: paymentMethod,
      balanceBefore: (student.accountBalance || 0) + paymentAmount,
      balanceAfter: student.accountBalance
    });
    await transaction.save();

    // Generate receipt
    const receipt = await generateReceipt(payment, paymentAmount, paymentMethod);

    console.log(`Payment processed successfully for student ${studentId}`);
    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment,
      transaction,
      receipt
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment', 
      error: error.message 
    });
  }
});

// Add this to clear ALL finance data
router.delete('/admin/clear-all-data', async (req, res) => {
  try {
    await Payment.deleteMany({});
    await Transaction.deleteMany({});
    await Receipt.deleteMany({});
    
    // Also reset student balances
    await Student.updateMany({}, { $set: { accountBalance: 0 } });
    
    res.json({ 
      message: 'All finance data cleared successfully',
      cleared: {
        payments: true,
        transactions: true,
        receipts: true,
        studentBalances: true
      }
    });
  } catch (error) {
    console.error('Error clearing finance data:', error);
    res.status(500).json({ message: 'Failed to clear data', error: error.message });
  }
});

// ✅ Generate receipt from payment data - UPDATED WITH BALANCE
router.get('/payment/:paymentId/receipt', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    console.log('Generating receipt for payment:', paymentId);
    
    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get student information
    const student = await Student.findOne({ studentId: payment.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate remaining balance for the student
    const studentPayments = await Payment.find({ studentId: payment.studentId });
    const totalDue = studentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const totalPaid = studentPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const balanceRemaining = totalDue - totalPaid;

    // Check if receipt already exists
    let receipt = await Receipt.findOne({ paymentId: paymentId });
    
    if (!receipt) {
      // Generate new receipt
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      receipt = new Receipt({
        receiptNumber,
        studentId: payment.studentId,
        studentName: payment.studentName,
        paymentId: payment._id,
        amount: payment.amountPaid || payment.amount,
        description: payment.description,
        paymentMethod: 'Online Payment',
        status: payment.status === 'completed' ? 'completed' : 'pending',
        date: new Date(),
        items: [{
          description: payment.description,
          amount: payment.amountPaid || payment.amount,
          type: payment.type
        }],
        subtotal: payment.amountPaid || payment.amount,
        tax: 0,
        total: payment.amountPaid || payment.amount
      });

      await receipt.save();
      console.log('New receipt generated:', receiptNumber);
    }

    // Return enhanced receipt data
    const enhancedReceipt = {
      id: receipt._id,
      receiptNumber: receipt.receiptNumber,
      student: receipt.studentName,
      studentId: receipt.studentId,
      studentEmail: student.email,
      studentCourse: student.course,
      date: receipt.date,
      time: receipt.date.toLocaleTimeString(),
      paymentMethod: receipt.paymentMethod,
      status: receipt.status,
      items: receipt.items,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      total: receipt.total,
      paymentDetails: {
        description: payment.description,
        dueDate: payment.dueDate,
        type: payment.type,
        originalAmount: payment.amount,
        amountPaid: payment.amountPaid,
        amountRemaining: payment.amount - payment.amountPaid
      },
      transactionId: `TXN-${receipt._id.toString().slice(-8).toUpperCase()}`,
      // ✅ ADD BALANCE INFORMATION
      balanceInfo: {
        totalDue: totalDue,
        totalPaid: totalPaid,
        balanceRemaining: balanceRemaining
      }
    };

    res.json(enhancedReceipt);
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Failed to generate receipt', error: error.message });
  }
});


// ✅ Get receipt by ID - UPDATED WITH BALANCE
router.get('/receipt/:receiptId', async (req, res) => {
  try {
    const { receiptId } = req.params;
    
    console.log('🔍 Fetching receipt with ID:', receiptId);
    
    // First try to find the receipt by ID
    let receipt = await Receipt.findById(receiptId);
    
    if (receipt) {
      console.log('✅ Found receipt in database');
      
      // Get student information
      const student = await Student.findOne({ studentId: receipt.studentId });
      
      // Calculate remaining balance for the student
      const studentPayments = await Payment.find({ studentId: receipt.studentId });
      const totalDue = studentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalPaid = studentPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
      const balanceRemaining = totalDue - totalPaid;
      
      const enhancedReceipt = {
        id: receipt._id,
        receiptNumber: receipt.receiptNumber,
        student: receipt.studentName,
        studentId: receipt.studentId,
        studentEmail: student?.email || 'N/A',
        studentCourse: student?.course || 'N/A',
        date: receipt.date,
        time: receipt.date.toLocaleTimeString(),
        paymentMethod: receipt.paymentMethod,
        status: receipt.status,
        items: receipt.items || [],
        subtotal: receipt.subtotal,
        tax: receipt.tax,
        total: receipt.total,
        transactionId: `TXN-${receipt._id.toString().slice(-8).toUpperCase()}`,
        // ✅ ADD BALANCE INFORMATION
        balanceInfo: {
          totalDue: totalDue,
          totalPaid: totalPaid,
          balanceRemaining: balanceRemaining
        }
      };
      
      return res.json(enhancedReceipt);
    }
    
    // If no receipt found, try to find a transaction and generate receipt from it
    console.log('🔍 No receipt found, looking for transaction:', receiptId);
    const transaction = await Transaction.findById(receiptId);
    
    if (transaction) {
      console.log('✅ Found transaction, generating receipt from transaction');
      
      // Get student information
      const student = await Student.findOne({ studentId: transaction.studentId });
      
      // Calculate remaining balance for the student
      const studentPayments = await Payment.find({ studentId: transaction.studentId });
      const totalDue = studentPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalPaid = studentPayments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
      const balanceRemaining = totalDue - totalPaid;
      
      // Generate receipt from transaction
      const generatedReceipt = {
        id: transaction._id,
        receiptNumber: `RCP-TXN-${transaction._id.toString().slice(-8).toUpperCase()}`,
        student: transaction.studentName,
        studentId: transaction.studentId,
        studentEmail: student?.email || 'N/A',
        studentCourse: student?.course || 'N/A',
        date: transaction.date,
        time: transaction.date.toLocaleTimeString(),
        paymentMethod: 'Online Payment',
        status: transaction.status,
        items: [{
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type
        }],
        subtotal: transaction.amount,
        tax: 0,
        total: transaction.amount,
        transactionId: transaction.transactionId,
        paymentDetails: {
          description: transaction.description,
          type: transaction.type,
          amount: transaction.amount
        },
        // ✅ ADD BALANCE INFORMATION
        balanceInfo: {
          totalDue: totalDue,
          totalPaid: totalPaid,
          balanceRemaining: balanceRemaining
        }
      };
      
      return res.json(generatedReceipt);
    }
    
    // If neither receipt nor transaction found
    console.log('❌ No receipt or transaction found with ID:', receiptId);
    return res.status(404).json({ 
      message: 'Receipt not found',
      id: receiptId 
    });
    
  } catch (error) {
    console.error('❌ Error fetching receipt:', error);
    res.status(500).json({ 
      message: 'Failed to fetch receipt', 
      error: error.message 
    });
  }
});


// ✅ Get transaction by ID - ADD THIS TOO
router.get('/admin/transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    console.log('Fetching transaction:', transactionId);
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      id: transaction._id,
      transactionId: transaction.transactionId,
      studentId: transaction.studentId,
      studentName: transaction.studentName,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      date: transaction.date,
      paymentId: transaction.paymentId
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Failed to fetch transaction', error: error.message });
  }
});


export default router;

