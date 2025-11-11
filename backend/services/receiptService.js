// services/receiptService.js - NEW FILE
import Receipt from '../models/Receipt.js';
import Payment from '../models/Payment.js';

class ReceiptService {
  // ✅ Generate receipt when payment is approved or updated
  static async generateReceiptForPayment(paymentId, adminAction = false) {
    try {
      console.log(`🔄 Generating receipt for payment: ${paymentId}`);
      
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Only generate receipt if payment has actual paid amount
      if (payment.amountPaid <= 0) {
        console.log('⏭️ No amount paid, skipping receipt generation');
        return null;
      }

      // Check if we already have a recent receipt for this payment
      if (payment.receiptGenerated && payment.lastReceiptUpdate) {
        const timeSinceLastUpdate = Date.now() - new Date(payment.lastReceiptUpdate).getTime();
        const FIVE_MINUTES = 5 * 60 * 1000;
        
        if (timeSinceLastUpdate < FIVE_MINUTES && !adminAction) {
          console.log('⏭️ Recent receipt exists, skipping generation');
          return await Receipt.findById(payment.receiptId);
        }
      }

      // Generate receipt number
      const receiptCount = await Receipt.countDocuments();
      const receiptNumber = `RCP-${String(receiptCount + 1).padStart(6, '0')}`;

      // Create receipt items
      const receiptItems = [{
        description: payment.description || 'School Fees Payment',
        amount: payment.amountPaid,
        type: 'payment'
      }];

      // Calculate totals
      const subtotal = payment.amountPaid;
      const tax = 0; // Adjust if you have tax
      const total = subtotal + tax;

      // Create receipt
      const receiptData = {
        receiptNumber,
        studentId: payment.studentId,
        studentName: payment.studentName,
        studentEmail: payment.studentEmail,
        studentCourse: payment.studentCourse,
        paymentId: payment._id,
        items: receiptItems,
        subtotal,
        tax,
        total,
        paymentMethod: 'approved_payment', // or get from payment if available
        status: 'completed',
        date: new Date()
      };

      let receipt;

      // Update existing receipt or create new one
      if (payment.receiptId) {
        receipt = await Receipt.findByIdAndUpdate(
          payment.receiptId,
          receiptData,
          { new: true }
        );
        console.log('📝 Updated existing receipt:', receipt._id);
      } else {
        receipt = new Receipt(receiptData);
        await receipt.save();
        console.log('📝 Created new receipt:', receipt._id);
      }

      // Update payment with receipt info
      await Payment.findByIdAndUpdate(paymentId, {
        receiptGenerated: true,
        receiptId: receipt._id,
        lastReceiptUpdate: new Date()
      });

      console.log('✅ Receipt generated successfully:', receipt.receiptNumber);
      return receipt;

    } catch (error) {
      console.error('❌ Error generating receipt:', error);
      throw error;
    }
  }

  // ✅ Generate receipt for new payment entry
  static async generateReceiptForNewPayment(paymentData) {
    try {
      console.log('🔄 Generating receipt for new payment entry');
      
      const receiptCount = await Receipt.countDocuments();
      const receiptNumber = `RCP-${String(receiptCount + 1).padStart(6, '0')}`;

      const receiptItems = [{
        description: paymentData.description || 'School Fees Payment',
        amount: paymentData.amountPaid || paymentData.amount,
        type: 'payment'
      }];

      const subtotal = paymentData.amountPaid || paymentData.amount;
      const tax = 0;
      const total = subtotal + tax;

      const receipt = new Receipt({
        receiptNumber,
        studentId: paymentData.studentId,
        studentName: paymentData.studentName,
        studentEmail: paymentData.studentEmail,
        studentCourse: paymentData.studentCourse,
        paymentId: paymentData._id,
        items: receiptItems,
        subtotal,
        tax,
        total,
        paymentMethod: 'admin_entry',
        status: 'completed',
        date: new Date()
      });

      await receipt.save();

      // Update payment with receipt info
      await Payment.findByIdAndUpdate(paymentData._id, {
        receiptGenerated: true,
        receiptId: receipt._id,
        lastReceiptUpdate: new Date()
      });

      console.log('✅ Receipt generated for new payment:', receipt.receiptNumber);
      return receipt;

    } catch (error) {
      console.error('❌ Error generating receipt for new payment:', error);
      throw error;
    }
  }

  // ✅ Bulk generate receipts for existing payments
  static async generateMissingReceipts() {
    try {
      console.log('🔄 Checking for missing receipts...');
      
      const paymentsWithoutReceipts = await Payment.find({
        amountPaid: { $gt: 0 },
        $or: [
          { receiptGenerated: false },
          { receiptGenerated: { $exists: false } }
        ]
      });

      console.log(`📋 Found ${paymentsWithoutReceipts.length} payments without receipts`);

      const results = {
        total: paymentsWithoutReceipts.length,
        generated: 0,
        errors: 0
      };

      for (const payment of paymentsWithoutReceipts) {
        try {
          await this.generateReceiptForPayment(payment._id, true);
          results.generated++;
        } catch (error) {
          console.error(`❌ Failed to generate receipt for payment ${payment._id}:`, error);
          results.errors++;
        }
      }

      console.log('✅ Missing receipts generation completed:', results);
      return results;

    } catch (error) {
      console.error('❌ Error generating missing receipts:', error);
      throw error;
    }
  }
}

export default ReceiptService;