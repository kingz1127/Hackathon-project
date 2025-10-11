import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, // uploaded file path or external link
  fileType: { type: String }, // e.g. pdf, zip, docx
  uploadedAt: { type: Date, default: Date.now },
});

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true, 
    trim: true,
  },
  dob: { type: String, required: true },
  course: { type: String, required: true, trim: true },
  dateJoined: { type: String, required: true },
  teacherImg: { type: String, required: true },
  nation: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  resources: [resourceSchema], // ✅ New addition
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update timestamp
teacherSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

teacherSchema.index({ email: 1 });
teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ isActive: 1 });

const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;
