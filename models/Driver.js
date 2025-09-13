import {  DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Driver = sequelize.define('Driver', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
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
    vehicle_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vehicle_license_plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    vehicle_color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: null
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'drivers',
    timestamps: true
});


// Define associations

Driver.associate = (models) => {
    Driver.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'driver'
    });
   
};


Driver.sync();
export default Driver;