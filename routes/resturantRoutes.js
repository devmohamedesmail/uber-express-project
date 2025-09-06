import express from 'express';
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
  toggleRestaurantStatus,
  verifyRestaurant
} from '../controllers/restaurants_controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (require authentication)
router.post('/', createRestaurant);
router.get('/my/restaurant', getMyRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);
router.patch('/:id/toggle-status', toggleRestaurantStatus);

// Admin only routes
router.patch('/:id/verify', verifyRestaurant);

export { router as restaurantRoutes };

