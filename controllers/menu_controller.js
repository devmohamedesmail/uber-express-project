import Menu from '../models/Menu.js';
import Restaurant from '../models/Restaurant.js';
import { v2 as cloudinary } from 'cloudinary';

// Create menu item
export const createMenuItem = async (req, res) => {
    try {
        const {
            restaurant_id,
            title,
            description,
            price,
            image
        } = req.body;

        // Handle image upload if file is provided
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

        const menuItem = await Menu.create({
            restaurant_id,
            title,
            description,
            price,
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: menuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create menu item",
            error: error.message
        });
    }
};

// Get all menu items for a restaurant
export const getRestaurantMenuItems = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const menuItems = await Menu.findAll({
            where: { restaurant_id }
        });

        res.status(200).json({
            success: true,
            message: "Menu items retrieved successfully",
            data: menuItems
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve menu items",
            error: error.message
        });
    }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await Menu.findByPk(id);

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
        res.status(500).json({
            success: false,
            message: "Failed to retrieve menu item",
            error: error.message
        });
    }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Handle image upload if file is provided
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

        const [updated] = await Menu.update(updateData, {
            where: { id }
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        const updatedMenuItem = await Menu.findByPk(id);

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            data: updatedMenuItem
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update menu item",
            error: error.message
        });
    }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Menu.destroy({
            where: { id }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Menu item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete menu item",
            error: error.message
        });
    }
};