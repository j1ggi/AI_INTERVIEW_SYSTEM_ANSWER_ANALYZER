import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default in queries
    },
    targetRole: {
      type: String,
      enum: [
        'Software Development Engineer',
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'Data Analyst',
        'Java Developer',
        'Python Developer',
        'DevOps Engineer',
      ],
      default: 'Software Development Engineer',
    },
    experienceLevel: {
      type: String,
      enum: ['Entry-Level', 'Junior', 'Mid-Level', 'Senior'],
      default: 'Entry-Level',
    },
    preferredTopics: {
      type: [String],
      default: ['Data Structures & Algorithms', 'Database Management Systems', 'System Design'],
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Instance method: Verify candidate password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Safe JSON serialization: remove sensitive fields
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);
export default User;
