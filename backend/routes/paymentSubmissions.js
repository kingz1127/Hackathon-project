// // routes/paymentSubmissions.js
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   },
//   fileFilter: function (req, file, cb) {
//     const filetypes = /jpeg|jpg|png|pdf/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
    
//     if (mimetype && extname) {
//       return cb(null, true);
//     } else {
//       cb(new Error('Only image files (JPEG, PNG, JPG) and PDFs are allowed'));
//     }
//   }
// });

// // Temporary storage (replace with database in production)
// let paymentSubmissions = [];

// // Submit payment for admin review
// router.post('/submit-payment', upload.single('receipt'), async (req, res) => {
//   try {
//     console.log('Payment submission received:', req.body);
//     console.log('File:', req.file);

//     const {
//       paymentId,
//       studentId,
//       amount,
//       paymentMethod,
//       transactionId,
//       notes
//     } = req.body;

//     if (!studentId || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Student ID and amount are required'
//       });
//     }

//     // Create submission object
//     const submission = {
//       id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       paymentId: paymentId || 'unknown',
//       studentId: studentId,
//       studentName: `Student ${studentId}`, // In production, fetch from database
//       amount: parseFloat(amount),
//       paymentMethod: paymentMethod || 'bank_transfer',
//       transactionId: transactionId || `txn_${Date.now()}`,
//       notes: notes || '',
//       receiptFile: req.file ? `/uploads/${req.file.filename}` : null,
//       status: 'pending',
//       submittedAt: new Date().toISOString(),
//       reviewedAt: null,
//       adminNotes: null,
//       paymentDescription: `Payment for ${paymentId}` // You can customize this
//     };

//     // Store the submission
//     paymentSubmissions.push(submission);
//     console.log('Stored submission:', submission);

//     res.status(201).json({
//       success: true,
//       message: 'Payment submitted for review',
//       submissionId: submission.id
//     });

//   } catch (error) {
//     console.error('Error submitting payment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to submit payment: ' + error.message
//     });
//   }
// });

// // Get pending submissions for admin
// router.get('/admin/pending-submissions', (req, res) => {
//   try {
//     const pending = paymentSubmissions.filter(sub => sub.status === 'pending');
//     console.log('Returning pending submissions:', pending.length);
    
//     res.json({
//       success: true,
//       submissions: pending
//     });
//   } catch (error) {
//     console.error('Error fetching pending submissions:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch pending submissions'
//     });
//   }
// });

// // Get all submissions for admin
// router.get('/admin/all-submissions', (req, res) => {
//   try {
//     console.log('Returning all submissions:', paymentSubmissions.length);
//     res.json({
//       success: true,
//       submissions: paymentSubmissions
//     });
//   } catch (error) {
//     console.error('Error fetching all submissions:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch submissions'
//     });
//   }
// });

// // Update payment status
// router.put('/admin/update-status/:submissionId', (req, res) => {
//   try {
//     const { submissionId } = req.params;
//     const { status, adminNotes } = req.body;

//     console.log('Updating submission:', submissionId, 'to:', status);

//     const submission = paymentSubmissions.find(sub => sub.id === submissionId);
    
//     if (!submission) {
//       return res.status(404).json({
//         success: false,
//         message: 'Submission not found'
//       });
//     }

//     submission.status = status;
//     submission.adminNotes = adminNotes;
//     submission.reviewedAt = new Date().toISOString();

//     res.json({
//       success: true,
//       message: `Payment ${status} successfully`
//     });

//   } catch (error) {
//     console.error('Error updating payment status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update payment status'
//     });
//   }
// });

// module.exports = router;