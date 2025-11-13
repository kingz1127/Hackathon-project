import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  content: {
    type: String // Text submission
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: {
    type: Number,
    min: 0
  },
  maxGrade: {
    type: Number
  },
  feedback: {
    type: String
  },
  gradedAt: {
    type: Date
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for checking if submission was late
submissionSchema.virtual('isLate').get(function() {
  if (!this.populated('assignmentId')) return false;
  return this.submittedAt > this.assignmentId.dueDate;
});

// Virtual for grade percentage
submissionSchema.virtual('percentage').get(function() {
  if (!this.grade || !this.maxGrade) return null;
  return ((this.grade / this.maxGrade) * 100).toFixed(2);
});

submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Submission', submissionSchema);