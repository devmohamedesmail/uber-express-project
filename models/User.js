import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    identifier: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'restaurant_owner', 'driver'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: 'users',
    timestamps: true
});

// Define associations
User.associate = (models) => {
    User.hasOne(models.Restaurant, {
        foreignKey: 'user_id',
        as: 'restaurant'
    });

    User.hasOne(models.Driver, {
        foreignKey: 'user_id',
        as: 'driver'
    });
    User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders'
    });
};





User.sync()
export default User;
