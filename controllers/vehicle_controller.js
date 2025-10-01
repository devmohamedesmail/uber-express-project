import Vehicle from '../models/Vehicle.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Create new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { type, price, image } = req.body;

    // Handle image upload if file is provided
    let imageUrl = image;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'vehicles');
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message
        });
      }
    }

    const vehicle = await Vehicle.create({
      type,
      price,
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create vehicle",
      error: error.message
    });
  }
};

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicles",
      error: error.message
    });
  }
};

// Get vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve vehicle",
      error: error.message
    });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle image upload if file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'vehicles');
        updateData.image = uploadResult.secure_url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload image",
          error: uploadError.message
        });
      }
    }

    const [updated] = await Vehicle.update(updateData, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    const updatedVehicle = await Vehicle.findByPk(id);

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update vehicle",
      error: error.message
    });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Vehicle.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete vehicle",
      error: error.message
    });
  }
};
