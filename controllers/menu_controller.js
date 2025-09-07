import Menu from '../models/Menu.js';
import Restaurant from '../models/restaurant.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { v2 as cloudinary } from 'cloudinary';

/**
 * CREATE MENU ITEM
 * Creates a new menu item for a restaurant
 * Only restaurant owners can create menu items for their restaurant
 */
export const createMenuItem = async (req, res) => {
    try {

        const {
            userId,
            restaurant_id,
            name,
            description,
            price,
            category,
            preparation_time,
            ingredients,
            allergens,
            calories,
            is_vegetarian,
            is_vegan,
            spice_level
        } = req.body;

        // Authentication check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }

        // Check if restaurant exists
        const restaurant = await Restaurant.findByPk(restaurant_id);
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
                message: "You can only create menu items for your own restaurant"
            });
        }

        // Handle image upload to Cloudinary
        let imageUrl = null;
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'menu-items' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = uploadResult.secure_url;
        }

        // Create menu item
        const menuItem = await Menu.create({
            restaurant_id,
            name,
            description,
            price: parseFloat(price),
            image: imageUrl,
            category,
            preparation_time,
            ingredients,
            allergens,
            calories: calories ? parseInt(calories) : null,
            is_vegetarian: is_vegetarian === 'true' || is_vegetarian === true,
            is_vegan: is_vegan === 'true' || is_vegan === true,
            spice_level
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: menuItem
        });

    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create menu item",
            error: error.message
        });
    }
};

/**
 * GET ALL MENU ITEMS FOR A RESTAURANT
 * Fetches all menu items for a specific restaurant with filtering options
 */
export const getRestaurantMenuItems = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // Check if restaurant exists
        const restaurant = await Restaurant.findByPk(restaurant_id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        // Simple query without filters first
        const menuItems = await Menu.findAll({
            where: {
                restaurant_id: restaurant_id
            }
        });

        console.log('Restaurant ID:', restaurant_id);
        console.log('Menu items found:', menuItems.length);

        res.status(200).json({
            success: true,
            message: "Menu items retrieved successfully",
            data: {
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    location: restaurant.location
                },
                menu_items: menuItems,
                total_items: menuItems.length
            }
        });

    } catch (error) {
        console.error('Get restaurant menu items error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve menu items",
            error: error.message
        });
    }
};

/**
 * GET MENU ITEM BY ID
 * Fetches a specific menu item by its ID
 */
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await Menu.findByPk(id, {
            include: [{
                model: Restaurant,
                as: 'restaurant',
                attributes: ['id', 'name', 'location', 'cuisine_type']
            }]
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item retrieved successfully",
            data: menuItem
        });

    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve menu item",
            error: error.message
        });
    }
};

/**
 * UPDATE MENU ITEM
 * Updates an existing menu item
 * Only restaurant owners can update their menu items
 */
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;

        // Authentication check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Find menu item
        const menuItem = await Menu.findByPk(id, {
            include: [{
                model: Restaurant,
                as: 'restaurant'
            }]
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        // Check if user owns this restaurant or is admin
        const user = await User.findByPk(userId);
        if (menuItem.restaurant.user_id !== userId && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You can only update menu items for your own restaurant"
            });
        }

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.id;
        delete updateData.restaurant_id;

        // Handle image upload to Cloudinary
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'menu-items' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            updateData.image = uploadResult.secure_url;
        }

        // Convert string booleans to actual booleans
        if (updateData.is_vegetarian !== undefined) {
            updateData.is_vegetarian = updateData.is_vegetarian === 'true' || updateData.is_vegetarian === true;
        }
        if (updateData.is_vegan !== undefined) {
            updateData.is_vegan = updateData.is_vegan === 'true' || updateData.is_vegan === true;
        }
        if (updateData.is_available !== undefined) {
            updateData.is_available = updateData.is_available === 'true' || updateData.is_available === true;
        }

        // Convert price and calories to proper types
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.calories) updateData.calories = parseInt(updateData.calories);

        // Update menu item
        await menuItem.update(updateData);

        // Fetch updated menu item with restaurant info
        const updatedMenuItem = await Menu.findByPk(id, {
            include: [{
                model: Restaurant,
                as: 'restaurant',
                attributes: ['id', 'name', 'location', 'cuisine_type']
            }]
        });

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: updatedMenuItem
        });

    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update menu item",
            error: error.message
        });
    }
};

/**
 * DELETE MENU ITEM
 * Deletes a menu item
 * Only restaurant owners can delete their menu items
 */
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Authentication check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Find menu item
        const menuItem = await Menu.findByPk(id, {
            include: [{
                model: Restaurant,
                as: 'restaurant'
            }]
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        // Check if user owns this restaurant or is admin
        const user = await User.findByPk(userId);
        if (menuItem.restaurant.user_id !== userId && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You can only delete menu items for your own restaurant"
            });
        }

        // Delete menu item
        await menuItem.destroy();

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });

    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete menu item",
            error: error.message
        });
    }
};

/**
 * TOGGLE MENU ITEM AVAILABILITY
 * Toggles the availability status of a menu item
 */
export const toggleMenuItemAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Authentication check
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Find menu item
        const menuItem = await Menu.findByPk(id, {
            include: [{
                model: Restaurant,
                as: 'restaurant'
            }]
        });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        // Check if user owns this restaurant or is admin
        const user = await User.findByPk(userId);
        if (menuItem.restaurant.user_id !== userId && user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You can only manage menu items for your own restaurant"
            });
        }

        // Toggle availability
        await menuItem.update({ is_available: !menuItem.is_available });

        res.status(200).json({
            success: true,
            message: `Menu item ${menuItem.is_available ? 'made available' : 'made unavailable'} successfully`,
            data: {
                id: menuItem.id,
                name: menuItem.name,
                is_available: menuItem.is_available
            }
        });

    } catch (error) {
        console.error('Toggle menu item availability error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle menu item availability",
            error: error.message
        });
    }
};

/**
 * GET MENU CATEGORIES FOR A RESTAURANT
 * Returns unique categories for a restaurant's menu
 */
export const getMenuCategories = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // Check if restaurant exists
        const restaurant = await Restaurant.findByPk(restaurant_id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        const categories = await Menu.findAll({
            where: {
                restaurant_id,
                category: { [Op.ne]: null },
                is_available: true
            },
            attributes: ['category'],
            group: ['category'],
            raw: true
        });

        const categoryList = categories.map(item => item.category).filter(Boolean);

        res.status(200).json({
            success: true,
            message: "Menu categories retrieved successfully",
            data: {
                restaurant_id,
                categories: categoryList
            }
        });

    } catch (error) {
        console.error('Get menu categories error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve menu categories",
            error: error.message
        });
    }
};
