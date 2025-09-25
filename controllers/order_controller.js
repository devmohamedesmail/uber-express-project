import Order from '../models/Order.js';
import User from '../models/User.js';
import Restaurant from '../models/restaurant.js';
// import { Op, sequelize } from 'sequelize';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      restaurant_id,
      order,
      total_price,
      delivery_address
    } = req.body;

    // Create order
    const newOrder = await Order.create({
      user_id,
      restaurant_id,
      order,
      total_price,
      delivery_address,
      status: 'pending',
      placed_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: newOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

// Get all orders (with filtering)
export const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      user_id, 
      restaurant_id 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (user_id) whereClause.user_id = user_id;
    if (restaurant_id) whereClause.restaurant_id = restaurant_id;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'identifier']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['placed_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: orders.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(orders.count / limit),
          total_orders: orders.count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'identifier']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: error.message
    });
  }
};

// Get orders by user ID
export const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { user_id };
    if (status) whereClause.status = status;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['placed_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: {
        orders: orders.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(orders.count / limit),
          total_orders: orders.count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user orders",
      error: error.message
    });
  }
};

// Get orders by restaurant ID
export const getRestaurantOrders = async (req, res) => {
  try {
    const { restaurant_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { restaurant_id };
    if (status) whereClause.status = status;

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'identifier']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['placed_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: "Restaurant orders retrieved successfully",
      data: {
        orders: orders.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(orders.count / limit),
          total_orders: orders.count,
          per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve restaurant orders",
      error: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Valid statuses are: " + validStatuses.join(', ')
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update delivered_at timestamp when order is delivered
    const updateData = { status };
    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    }

    await order.update(updateData);

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

// Update entire order
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.id;
    delete updateData.placed_at;

    const [updated] = await Order.update(updateData, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'identifier']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'address', 'phone']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message
    });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order that is already delivered or cancelled"
      });
    }

    await order.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message
    });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Order.destroy({
      where: { id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message
    });
  }
};

// Get order statistics
export const getOrderStatistics = async (req, res) => {
  try {
    const { restaurant_id, user_id, start_date, end_date } = req.query;
    
    const whereClause = {};
    if (restaurant_id) whereClause.restaurant_id = restaurant_id;
    if (user_id) whereClause.user_id = user_id;
    
    if (start_date && end_date) {
      whereClause.placed_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // Get total orders count
    const totalOrders = await Order.count({ where: whereClause });

    // Get orders by status
    const ordersByStatus = await Order.findAll({
      where: whereClause,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true
    });

    // Get total revenue
    const revenueResult = await Order.findOne({
      where: {
        ...whereClause,
        status: 'delivered'
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('total_price')), 'total_revenue']],
      raw: true
    });

    const totalRevenue = revenueResult?.total_revenue || 0;

    // Get average order value
    const avgOrderResult = await Order.findOne({
      where: whereClause,
      attributes: [[sequelize.fn('AVG', sequelize.col('total_price')), 'avg_order_value']],
      raw: true
    });

    const avgOrderValue = avgOrderResult?.avg_order_value || 0;

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: {
        total_orders: totalOrders,
        orders_by_status: ordersByStatus,
        total_revenue: parseFloat(totalRevenue),
        average_order_value: parseFloat(avgOrderValue)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order statistics",
      error: error.message
    });
  }
};
