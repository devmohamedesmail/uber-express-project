import express from 'express';
import {
  createMenuItem,
  getRestaurantMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menu_controller.js';
import multer from 'multer';
const storage = multer.memoryStorage(); // store file in memory buffer
const upload = multer({ storage });

const router = express.Router();

// Public routes - Menu browsing
router.get('/restaurant/:restaurant_id', getRestaurantMenuItems);          // GET /menu/restaurant/:restaurant_id
router.get('/item/:id', getMenuItemById);                                // GET /menu/item/:id

// Protected routes - Menu management (require authentication)
router.post('/create', upload.single('image'), createMenuItem);                                  // POST /menu/create
router.put('/item/:id', upload.single('image'), updateMenuItem);                                 // PUT /menu/item/:id
router.delete('/item/:id', deleteMenuItem);                              // DELETE /menu/item/:id

export { router as menuRoutes };