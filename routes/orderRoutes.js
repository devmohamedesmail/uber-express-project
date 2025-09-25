import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  getRestaurantOrders,
  updateOrderStatus,
  updateOrder,
  cancelOrder,
  deleteOrder,
  getOrderStatistics
} from '../controllers/order_controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllOrders);                           // GET /orders - Get all orders with filtering
router.get('/statistics', getOrderStatistics);          // GET /orders/statistics - Get order statistics
router.get('/:id', getOrderById);                       // GET /orders/:id - Get specific order

// User-specific routes
router.get('/user/:user_id', getUserOrders);            // GET /orders/user/:user_id - Get user's orders

// Restaurant-specific routes  
router.get('/restaurant/:restaurant_id', getRestaurantOrders); // GET /orders/restaurant/:restaurant_id - Get restaurant's orders

// Order management routes
router.post('/', createOrder);                          // POST /orders - Create new order
router.put('/:id', updateOrder);                        // PUT /orders/:id - Update entire order
router.patch('/:id/status', updateOrderStatus);         // PATCH /orders/:id/status - Update order status only
router.patch('/:id/cancel', cancelOrder);               // PATCH /orders/:id/cancel - Cancel order
router.delete('/:id', deleteOrder);                     // DELETE /orders/:id - Delete order

export { router as orderRoutes };



