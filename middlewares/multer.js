// middleware/multer.js
import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = file.originalname.toLowerCase().split('.').pop();
  allowedTypes.test(ext) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

export default multer({ storage, fileFilter });