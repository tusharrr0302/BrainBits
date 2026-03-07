import mongoose from 'mongoose';

const studyBlockSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    enum: ['DSA', 'Web Development', 'Android Development', 'AI-ML']
  },
  topic: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  mcqPassed: {
    type: Boolean,
    default: false
  }
});

const dailyScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  studyBlocks: [studyBlockSchema],
  totalMinutes: {
    type: Number,
    default: 0
  }
});

const planSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  learningPath: {
    type: String,
    required: true,
    enum: ['DSA only', 'DSA + Web Development', 'DSA + Android Development', 'DSA + AI/ML', 'Full Stack Developer', 'Mobile App Developer', 'AI/ML Engineer']
  },
  weeklyHours: {
    type: Number,
    required: true
  },
  preferredDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  schedule: [dailyScheduleSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Plan', planSchema);
