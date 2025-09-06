import { Sequelize } from "sequelize";



const sequelize = new Sequelize(
    'u881625996_uber' , 
    'u881625996_uber' , 
    'Mm19921125@',
    {
    host: "153.92.15.44",
    port: 3306,
    dialect: 'mysql'
});




const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.log('Unable to connect to the database:', error);
    }
}

export { sequelize, connectDB };