import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    restaurant_id: {
        type: DataTypes.INTEGER,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },

}, {
    tableName: 'menus',
    timestamps: true
});

// Define associations

Menu.sync()
export default Menu;
