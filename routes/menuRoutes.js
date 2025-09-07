import express from 'express';
import {
  createMenuItem,
  getRestaurantMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuCategories
} from '../controllers/menu_controller.js';

const router = express.Router();

// Public routes - Menu browsing
// GET /menu/restaurant/:restaurant_id
router.get('/restaurant/:restaurant_id', getRestaurantMenuItems);  
// GET /menu/restaurant/:restaurant_id/categories        
router.get('/restaurant/:restaurant_id/categories', getMenuCategories);   
router.get('/item/:id', getMenuItemById);                                // GET /menu/item/:id

// Protected routes - Menu management (require authentication)
// POST /menu/restaurant/:restaurant_id
router.post('/create', createMenuItem); 
// PUT /menu/item/:id              
router.put('/item/:id', updateMenuItem);                                 
router.delete('/item/:id', deleteMenuItem);                              // DELETE /menu/item/:id
router.patch('/item/:id/toggle-availability', toggleMenuItemAvailability); // PATCH /menu/item/:id/toggle-availability

export { router as menuRoutes };