import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/authRoutes.js';
import { restaurantRoutes } from './routes/resturantRoutes.js';
import { menuRoutes } from './routes/menuRoutes.js';
import { v2 as cloudinary } from 'cloudinary';





const app = express();
dotenv.config();




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





cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,

  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
});