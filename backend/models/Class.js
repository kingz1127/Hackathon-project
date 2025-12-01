// import mongoose from 'mongoose';

// const classSchema = new mongoose.Schema({
//   courseId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//     required: true
//   },
//   teacherId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   className: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   description: {
//     type: String,
//     trim: true
//   },
//   schedule: {
//     day: {
//       type: String,
//       enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
//     },
//     time: {
//       type: String // e.g., "09:00 AM"
//     },
//     duration: {
//       type: Number // in minutes
//     }
//   },
//   semester: {
//     type: String,
//     required: true,
//     enum: ['Fall', 'Spring', 'Summer']
//   },
//   academicYear: {
//     type: String,
//     required: true // e.g., "2024-2025"
//   },
//   room: {
//     type: String,
//     trim: true
//   },
//   maxStudents: {
//     type: Number,
//     default: 30
//   },
//   enrolledStudents: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   status: {
//     type: String,
//     enum: ['active', 'completed', 'cancelled'],
//     default: 'active'
//   }
// }, {
//   timestamps: true
// });

// // Virtual for enrolled count
// classSchema.virtual('enrolledCount').get(function() {
//   return this.enrolledStudents.length;
// });

// // Ensure virtuals are included in JSON
// classSchema.set('toJSON', { virtuals: true });
// classSchema.set('toObject', { virtuals: true });

// export default mongoose.model('Class', classSchema);



import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {

    teacherId: { type: String, required: true },

    className: { type: String, required: true },
    description: { type: String, default: "" },

    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String
      }
    ],

    semester: { type: String, default: "" },
    academicYear: { type: String, default: "" },

    room: { type: String, default: "" },
    maxStudents: { type: Number, default: 30 },

    status: { type: String, default: "active" },

    enrolledStudents: [{ type: String }]  // student IDs
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);

export default Class;
