import express from 'express';
import { Book } from '../models/bookModel.js';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import streamifier from 'streamifier'; // To convert buffer to stream
import upload from '../middleware/multer.js';  // Importing the `upload` middleware

const router = express.Router();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, 'your_default_secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.userId = decoded.userId; // Store user ID in request
    next();
  });
};

// POST route to create a new book
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    const { title, author, publishYear } = req.body;

    // Check if required fields are provided
    if (!title || !author || !publishYear) {
      return res.status(400).json({ message: 'Missing required fields: title, author, publishYear' });
    }

    let imageUrl = '';
    if (req.file) {
      // Create a readable stream from the file buffer
      const streamUpload = (file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' }, // Automatically detect file type (image, video, etc.)
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream); // Pipe file buffer to Cloudinary stream
        });
      };

      // Upload image to Cloudinary
      const uploadResult = await streamUpload(req.file);
      imageUrl = uploadResult.secure_url; // Get the Cloudinary URL of the uploaded image
    }

    // Create a new book entry
    const newBook = {
      title,
      author,
      publishYear,
      image: imageUrl, // Cloudinary image URL (if available)
      userId: req.userId, // User ID from JWT
    };

    const book = await Book.create(newBook); // Save to database
    return res.status(201).json(book); // Return the created book as response
  } catch (error) {
    console.error('Error creating book:', error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
