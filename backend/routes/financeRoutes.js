// Enhanced financeRoutes.js with proper database operations and receipts

import express from 'express';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import Receipt from '../models/Receipt.js';
import Student from '../models/Student.js';

const router = express.Router();

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

// ✅ Get financial overview for admin
// ✅ Get financial overview for admin - UPDATED
router.get('/admin/overview', async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    const payments = await Payment.find();
    const transactions = await Transaction.find().sort({ date: -1 }).limit(10);

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

    const outstandingBalance = students.reduce((sum, student) => sum + (student.accountBalance || 0), 0);

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

    // Top students with balances (from student.accountBalance)
    const topStudents = students
      .filter(student => student.accountBalance > 0)
      .sort((a, b) => b.accountBalance - a.accountBalance)
      .slice(0, 5)
      .map(student => ({
        id: student.studentId,
        name: student.fullName,
        balance: student.accountBalance,
        status: student.accountBalance > 1000 ? 'Overdue' : 'Due Soon'
      }));

    const overviewData = {
      totalRevenue,
      revenueTrend: totalRevenue > 0 ? 12.5 : 0,
      pendingPayments,
      collectedThisMonth,
      outstandingBalance,
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
      receipts: [] // Add actual receipts if you have them
    };

    res.json(overviewData);
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ message: 'Failed to fetch overview', error: error.message });
  }
});

// ✅ Get all payments for a specific student
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
    const payments = await Payment.find({ studentId }).sort({ createdAt: -1 });
    
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
        paymentId: payment.paymentId,
        studentId: payment.studentId,
        studentName: payment.studentName,
        amount: payment.amount,
        amountPaid: payment.amountPaid,
        totalAmount: payment.amount, // For compatibility with frontend
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


// ✅ Get student financial overview
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
    
    // Calculate financial metrics
    const totalDue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const amountPaid = payments.reduce((sum, payment) => sum + (payment.amountPaid || 0), 0);
    const amountRemaining = totalDue - amountPaid;

    // Get recent transactions for this student
    const recentTransactions = await Transaction.find({ studentId })
      .sort({ date: -1 })
      .limit(10)
      .select('description amount date status type');

    // Get upcoming due payments
    const upcomingPayments = payments
      .filter(payment => 
        payment.status === 'pending' || 
        payment.status === 'due' || 
        payment.status === 'partial'
      )
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Calculate payment distribution
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
      paymentDistribution: paymentDistribution.filter(item => item.amount > 0),
      upcomingPayments: upcomingPayments.map(payment => ({
        id: payment._id,
        description: payment.description,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
        type: payment.type
      })),
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction._id,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        status: transaction.status,
        type: transaction.type
      })),
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
router.post('/student/:studentId/make-payment', async (req, res) => {
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

export default router;

