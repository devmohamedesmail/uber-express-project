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
        allowNull: false,
        references: {
            model: 'restaurants',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    preparation_time: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ingredients: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    allergens: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    calories: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_vegetarian: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    is_vegan: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    spice_level: {
        type: DataTypes.ENUM('mild', 'medium', 'hot', 'extra_hot'),
        allowNull: true
    }
}, {
    tableName: 'menus',
    timestamps: true
});

// Define associations
Menu.associate = (models) => {
    Menu.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        as: 'restaurant'
    });
};

Menu.sync()
export default Menu;
