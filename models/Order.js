import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";


const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    order:{
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'preparing', 'on_the_way', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    placed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    tableName: 'orders',
    timestamps: true
})


// Define associations
Order.associate = (models) => {
    Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'customer'
    });

    Order.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant'
    });

  
}

Order.sync();
export default Order;