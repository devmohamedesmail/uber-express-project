import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Restaurant = sequelize.define('Restaurant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cuisine_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    opening_hours: {
        type: DataTypes.JSON,
        allowNull: true
    },
    delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    minimum_order: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    delivery_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0.0
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'restaurants',
    timestamps: true
});

// Define associations
Restaurant.associate = (models) => {
    Restaurant.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'owner'
    });
};

Restaurant.sync()
export default Restaurant;
