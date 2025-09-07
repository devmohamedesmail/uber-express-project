import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { v2 as cloudinary } from 'cloudinary';

// Create a new restaurant
export const createRestaurant = async (req, res) => {
  try {
  
    const {
      userId,
      name,
      image,
      location,
      address,
      phone,
      email,
      description,
      cuisine_type,
      opening_hours,
      delivery_fee,
      minimum_order,
      delivery_time
    } = req.body;

    // Check if user exists and has the right role
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== 'restaurant_owner' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only restaurant owners can create restaurants"
      });
    }

    // Check if user already has a restaurant (one-to-one relationship)
    const existingRestaurant = await Restaurant.findOne({ where: { user_id: userId } });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "You already have a restaurant. Each user can only own one restaurant."
      });
    }

    // Validate required fields
    if (!name || !location || !address || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Name, location, address, phone, and email are required"
      });
    }

    // Handle image upload to Cloudinary
    let imageUrl = image; // Use provided image URL if no file uploaded
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'restaurants' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      image: imageUrl,
      location,
      address,
      phone,
      email,
      description,
      cuisine_type,
      opening_hours,
      delivery_fee: delivery_fee || 0.00,
      minimum_order: minimum_order || 0.00,
      delivery_time,
      user_id: userId
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant
    });

  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Failed to create restaurant",
      error: error.message
    });
  }
};

// Get all restaurants
export const getAllRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 10, cuisine_type, location, is_active = true } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = { is_active };
    if (cuisine_type) whereClause.cuisine_type = cuisine_type;
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };

    const restaurants = await Restaurant.findAndCountAll({
      where: whereClause,
      // include: [{
      //   model: User,
      //   as: 'owner',
      //   attributes: ['id', 'name', 'identifier']
      // }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Restaurants retrieved successfully",
      data: {
        restaurants: restaurants.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(restaurants.count / limit),
          total_restaurants: restaurants.count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve restaurants",
      error: error.message
    });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id, {
      // include: [{
      //   model: User,
      //   as: 'owner',
      //   attributes: ['id', 'name', 'identifier']
      // }]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Restaurant retrieved successfully",
      data: restaurant
    });

  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve restaurant",
      error: error.message
    });
  }
};

// Get current user's restaurant
export const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const restaurant = await Restaurant.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'identifier']
      }]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "You don't have a restaurant yet"
      });
    }

    res.status(200).json({
      success: true,
      message: "Restaurant retrieved successfully",
      data: restaurant
    });

  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve restaurant",
      error: error.message
    });
  }
};

// Update restaurant
export const updateRestaurant = async (req, res) => {
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

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Check if user owns this restaurant or is admin
    const user = await User.findByPk(userId);
    if (restaurant.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only update your own restaurant"
      });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.rating; // Rating should be calculated from reviews
    delete updateData.total_reviews; // Should be calculated from reviews

    // Handle image upload to Cloudinary
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'restaurants' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      updateData.image = uploadResult.secure_url;
    }

    // Update restaurant
    await restaurant.update(updateData);

    // Fetch updated restaurant with owner info
    const updatedRestaurant = await Restaurant.findByPk(id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'identifier']
      }]
    });

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: updatedRestaurant
    });

  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant",
      error: error.message
    });
  }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Check if user owns this restaurant or is admin
    const user = await User.findByPk(userId);
    if (restaurant.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own restaurant"
      });
    }

    // Delete restaurant
    await restaurant.destroy();

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully"
    });

  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant",
      error: error.message
    });
  }
};

// Toggle restaurant active status
export const toggleRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Check if user owns this restaurant or is admin
    const user = await User.findByPk(userId);
    if (restaurant.user_id !== userId && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own restaurant"
      });
    }

    // Toggle active status
    await restaurant.update({ is_active: !restaurant.is_active });

    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.is_active ? 'activated' : 'deactivated'} successfully`,
      data: { is_active: restaurant.is_active }
    });

  } catch (error) {
    console.error('Toggle restaurant status error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle restaurant status",
      error: error.message
    });
  }
};

// Admin only: Verify restaurant
export const verifyRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check if user is admin
    const user = await User.findByPk(userId);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only admins can verify restaurants"
      });
    }

    // Find restaurant
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Toggle verification status
    await restaurant.update({ is_verified: !restaurant.is_verified });

    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.is_verified ? 'verified' : 'unverified'} successfully`,
      data: { is_verified: restaurant.is_verified }
    });

  } catch (error) {
    console.error('Verify restaurant error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify restaurant",
      error: error.message
    });
  }
};
