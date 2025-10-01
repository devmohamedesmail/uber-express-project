import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Vehicle = sequelize.define("Vehicle", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
}, {
    tableName: 'vehicles',
    timestamps: true
});

Vehicle.sync();
export default Vehicle;
