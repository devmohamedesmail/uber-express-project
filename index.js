import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authRoutes } from './routes/authRoutes.js';
import { restaurantRoutes } from './routes/resturantRoutes.js';




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


app.listen(3000, () => {
    connectDB();
    console.log(`Server is running on http://localhost:3000`);
});