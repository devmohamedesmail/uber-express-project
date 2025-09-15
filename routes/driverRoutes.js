import express from 'express';
import {
  createDriver,
  getAllDrivers,
  getDriverById,
  getMyDriverProfile,
  updateDriver,
  deleteDriver,
  toggleDriverAvailability,
  getAvailableDriversByVehicleType
} from '../controllers/driver_controller.js';

const router = express.Router();

// Public routes - Driver browsing
router.get('/', getAllDrivers);                                          // GET /drivers
router.get('/:id', getDriverById);                                       // GET /drivers/:id
router.get('/available/:vehicle_type', getAvailableDriversByVehicleType); // GET /drivers/available/:vehicle_type

// Protected routes - Driver management (require authentication)
router.post('/', createDriver);                                          // POST /drivers
router.get('/my/profile', getMyDriverProfile);                           // GET /drivers/my/profile
router.put('/:id', updateDriver);                                        // PUT /drivers/:id
router.delete('/:id', deleteDriver);                                     // DELETE /drivers/:id
router.patch('/:id/toggle-availability', toggleDriverAvailability);      // PATCH /drivers/:id/toggle-availability

export { router as driverRoutes };