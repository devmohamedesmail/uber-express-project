import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/authRoutes.js';
import { restaurantRoutes } from './routes/resturantRoutes.js';
import { menuRoutes } from './routes/menuRoutes.js';
import { driverRoutes } from './routes/driverRoutes.js';
import { orderRoutes } from './routes/orderRoutes.js';
import { v2 as cloudinary } from 'cloudinary';





const app = express();




// **************** Middleware ****************
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ***************** Routes ********************
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', authRoutes);
app.use('/api/resturants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/orders', orderRoutes);




// *************** Cloudinary Configuration ****************
cloudinary.config({
    cloud_name: "dkcoe5fam",
    api_key: 243957552679755,
    api_secret: "gqDwNjdMK2MqUC01S4RNY3o7SNs",

});


// *************** Start Server ****************
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});