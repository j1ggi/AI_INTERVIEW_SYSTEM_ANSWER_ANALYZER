import User from '../models/User.js';
import { ValidationError } from '../utils/customErrors.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, targetRole, experienceLevel, preferredTopics, bio } = req.body;

    const allowedRoles = [
      'Software Development Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Data Analyst',
      'Java Developer',
      'Python Developer',
      'DevOps Engineer',
    ];

    if (targetRole && !allowedRoles.includes(targetRole)) {
      throw new ValidationError(`Invalid target role. Allowed: ${allowedRoles.join(', ')}`);
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (targetRole) updates.targetRole = targetRole;
    if (experienceLevel) updates.experienceLevel = experienceLevel;
    if (Array.isArray(preferredTopics)) updates.preferredTopics = preferredTopics;
    if (typeof bio === 'string') updates.bio = bio.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
