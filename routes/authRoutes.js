import express from 'express';
import { deleteAccount, login, register } from '../controllers/auth_controllers.js';


 const router = express.Router();




router.post('/login', login);
router.post('/register', register);
router.post('/delete-account', deleteAccount);


export { router as authRoutes }




