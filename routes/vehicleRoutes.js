import express from 'express';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicle_controller.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Vehicle CRUD routes
router.get('/', getAllVehicles);                              // GET /vehicles - Get all vehicles
router.get('/:id', getVehicleById);                           // GET /vehicles/:id - Get vehicle by ID
router.post('/', upload.single('image'), createVehicle);      // POST /vehicles - Create new vehicle
router.put('/:id', upload.single('image'), updateVehicle);    // PUT /vehicles/:id - Update vehicle
router.delete('/:id', deleteVehicle);                         // DELETE /vehicles/:id - Delete vehicle

export { router as vehicleRoutes };
