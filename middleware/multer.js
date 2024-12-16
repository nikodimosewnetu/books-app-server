import multer from 'multer';
import cloudinary from 'cloudinary';

// Cloudinary config
cloudinary.config({
  cloud_name: 'dryogdntn',
  api_key: '224562959728326',
  api_secret: 'dwcQVBeCVwuReje_BUBcflD3ipE',
});

// Multer setup to handle file uploads in memory
const storage = multer.memoryStorage(); // Store files in memory
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
