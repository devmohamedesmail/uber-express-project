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
import multer from 'multer';
const storage = multer.memoryStorage(); // store file in memory buffer
const upload = multer({ storage });

const router = express.Router();

// Public routes
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (require authentication)
router.post('/', upload.single('image'), createRestaurant);
router.get('/my/restaurant', getMyRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);
router.patch('/:id/toggle-status', toggleRestaurantStatus);

// Admin only routes
router.patch('/:id/verify', verifyRestaurant);

export { router as restaurantRoutes };

