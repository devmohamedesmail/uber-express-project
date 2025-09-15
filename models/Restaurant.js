import {  DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Restaurant = sequelize.define('Restaurant', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },

    start_time:{
        type: DataTypes.STRING,
        allowNull: true
    },
    end_time:{
        type: DataTypes.STRING,
        allowNull: true
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
    Restaurant.hasMany(models.Menu, {
        foreignKey: 'restaurant_id',
        as: 'menus'
    });
};

Restaurant.sync()
export default Restaurant;
