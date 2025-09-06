
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import  jwt from 'jsonwebtoken';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, identifier, password } = req.body;

    // Validation
    if (!name || !identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (name, idenfier, password)",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { identifier } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this identifier already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      name,
      identifier,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(newUser.dataValues.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.dataValues.id,
        name: newUser.dataValues.name,
        identifier: newUser.dataValues.identifier,
        role: newUser.dataValues.role,
      },
      token,
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: "User registration failed",
      error: error.message,
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Identifier and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ where: { identifier } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.dataValues.id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.dataValues.id,
        name: user.dataValues.name,
        identifier: user.dataValues.identifier,
      },
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Logout user (client-side token removal, server-side blacklisting could be added)
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token from storage. Server-side, we can add the token
    // to a blacklist if needed (requires additional infrastructure)
    
    res.status(200).json({
      success: true,
      message: "Logout successful. Please remove the token from client storage.",
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Update user information
export const updateUser = async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming you have auth middleware that sets req.user
    const { name, idenfier, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare update data
    const updateData = {};

    // Update name if provided
    if (name) {
      updateData.name = name;
    }

    // Update identifier if provided and unique
    if (idenfier && idenfier !== user.dataValues.idenfier) {
      const existingUser = await User.findOne({ where: { idenfier } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "This identifier is already taken",
        });
      }
      updateData.idenfier = idenfier;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set new password",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.dataValues.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    await User.update(updateData, { where: { id: userId } });

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      user: {
        id: updatedUser?.dataValues.id,
        name: updatedUser?.dataValues.name,
        idenfier: updatedUser?.dataValues.idenfier,
      },
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update user information",
      error: error.message,
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    // Assuming you have auth middleware that sets req.user
    const { userId , password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation is required to delete account",
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Delete user
    await User.destroy({ where: { id: userId } });

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
      error: error.message,
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.dataValues.id,
        name: user.dataValues.name,
        idenfier: user.dataValues.idenfier,
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};
