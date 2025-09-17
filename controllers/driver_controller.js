import Driver from '../models/Driver.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { uploadToCloudinary } from '../utils/cloudinary.js';

/**
 * CREATE DRIVER PROFILE
 * Creates a new driver profile for a user
 * Only users with 'driver' role can create driver profiles
 */
export const createDriver = async (req, res) => {
  try {
    const {
      userId,
      vehicle_type,
      vehicle_license_plate,
      vehicle_color,
      image
    } = req.body;

    // Validate required fields
    if (!userId || !vehicle_type || !vehicle_license_plate) {
      return res.status(400).json({
        success: false,
        message: "User ID, vehicle type, and license plate are required"
      });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has driver role
    if (user.role !== 'driver' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only users with driver role can create driver profiles"
      });
    }

    // Check if user already has a driver profile (one-to-one relationship)
    const existingDriver = await Driver.findOne({ where: { user_id: userId } });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "You already have a driver profile. Each user can only have one driver profile."
      });
    }

    // Check if license plate is already taken
    const existingLicensePlate = await Driver.findOne({ 
      where: { vehicle_license_plate } 
    });
    if (existingLicensePlate) {
      return res.status(400).json({
        success: false,
        message: "This license plate is already registered"
      });
    }

    let imageUrl = image;
        if (req.file) {
            try {
                const uploadResult = await uploadToCloudinary(req.file.buffer, 'menu');
                imageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload image",
                    error: uploadError.message
                });
            }
        }

    // Create driver profile
    const driver = await Driver.create({
      user_id: userId,
      vehicle_type,
      vehicle_license_plate: vehicle_license_plate.toUpperCase(),
      vehicle_color,
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message: "Driver profile created successfully",
      data: driver
    });

  } catch (error) {
    console.error('Create driver error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create driver profile",
      error: error.message
    });
  }
};

/**
 * GET ALL DRIVERS
 * Retrieves all drivers with filtering and pagination
 */
export const getAllDrivers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      vehicle_type, 
      is_available,
      min_rating 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = {};
    
    if (vehicle_type) whereClause.vehicle_type = vehicle_type;
    if (is_available !== undefined) whereClause.is_available = is_available === 'true';
    if (min_rating) whereClause.rating = { [Op.gte]: parseFloat(min_rating) };

    const drivers = await Driver.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'identifier']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Drivers retrieved successfully",
      data: {
        drivers: drivers.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(drivers.count / limit),
          total_drivers: drivers.count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get drivers error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve drivers",
      error: error.message
    });
  }
};

/**
 * GET DRIVER BY ID
 * Retrieves a specific driver by their ID
 */
export const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await Driver.findByPk(id, {
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'identifier']
      }]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver retrieved successfully",
      data: driver
    });

  } catch (error) {
    console.error('Get driver error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve driver",
      error: error.message
    });
  }
};

/**
 * GET MY DRIVER PROFILE
 * Retrieves the current user's driver profile
 */
export const getMyDriverProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const driver = await Driver.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'identifier']
      }]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "You don't have a driver profile yet"
      });
    }

    res.status(200).json({
      success: true,
      message: "Driver profile retrieved successfully",
      data: driver
    });

  } catch (error) {
    console.error('Get my driver profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve driver profile",
      error: error.message
    });
  }
};

/**
 * UPDATE DRIVER PROFILE
 * Updates an existing driver profile
 * Only the driver owner or admin can update
 */
export const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find driver
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Check if user owns this driver profile or is admin
    const user = await User.findByPk(userId);
    if (driver.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only update your own driver profile"
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.rating; // Rating should be calculated from reviews
    delete updateData.total_reviews; // Should be calculated from reviews

    // Check if license plate is being updated and not taken by another driver
    if (updateData.vehicle_license_plate) {
      const existingLicensePlate = await Driver.findOne({
        where: { 
          vehicle_license_plate: updateData.vehicle_license_plate.toUpperCase(),
          id: { [Op.ne]: id } // Exclude current driver
        }
      });
      
      if (existingLicensePlate) {
        return res.status(400).json({
          success: false,
          message: "This license plate is already registered by another driver"
        });
      }
      
      updateData.vehicle_license_plate = updateData.vehicle_license_plate.toUpperCase();
    }

    // Update driver
    await driver.update(updateData);

    // Fetch updated driver with user info
    const updatedDriver = await Driver.findByPk(id, {
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'identifier']
      }]
    });

    res.status(200).json({
      success: true,
      message: "Driver profile updated successfully",
      data: updatedDriver
    });

  } catch (error) {
    console.error('Update driver error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update driver profile",
      error: error.message
    });
  }
};

/**
 * DELETE DRIVER PROFILE
 * Deletes a driver profile
 * Only the driver owner or admin can delete
 */
export const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find driver
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Check if user owns this driver profile or is admin
    const user = await User.findByPk(userId);
    if (driver.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own driver profile"
      });
    }

    // Delete driver
    await driver.destroy();

    res.status(200).json({
      success: true,
      message: "Driver profile deleted successfully"
    });

  } catch (error) {
    console.error('Delete driver error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete driver profile",
      error: error.message
    });
  }
};

/**
 * TOGGLE DRIVER AVAILABILITY
 * Toggles the availability status of a driver
 */
export const toggleDriverAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find driver
    const driver = await Driver.findByPk(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found"
      });
    }

    // Check if user owns this driver profile or is admin
    const user = await User.findByPk(userId);
    if (driver.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own driver profile"
      });
    }

    // Toggle availability
    await driver.update({ is_available: !driver.is_available });

    res.status(200).json({
      success: true,
      message: `Driver ${driver.is_available ? 'is now available' : 'is now unavailable'}`,
      data: { 
        id: driver.id,
        is_available: driver.is_available 
      }
    });

  } catch (error) {
    console.error('Toggle driver availability error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle driver availability",
      error: error.message
    });
  }
};

/**
 * GET AVAILABLE DRIVERS BY VEHICLE TYPE
 * Retrieves available drivers filtered by vehicle type
 */
export const getAvailableDriversByVehicleType = async (req, res) => {
  try {
    const { vehicle_type } = req.params;

    const drivers = await Driver.findAll({
      where: {
        vehicle_type,
        is_available: true
      },
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'identifier']
      }],
      order: [['rating', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: `Available ${vehicle_type} drivers retrieved successfully`,
      data: {
        vehicle_type,
        available_drivers: drivers,
        count: drivers.length
      }
    });

  } catch (error) {
    console.error('Get available drivers error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve available drivers",
      error: error.message
    });
  }
};