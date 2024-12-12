import express from 'express';
import {Book} from '../models/bookModel.js';
import upload from '../middleware/multer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    jwt.verify(token, 'your_default_secret_key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.userId = decoded.userId; 
        next();
    });
};


router.post('/', authenticate, upload.single('image'), async (req, res) => {
    try {
        const { title, author, publishYear } = req.body;
        if (!title || !author || !publishYear) {
            return res.status(400).send({
                message: 'Send all required fields: title, author, publishYear',
            });
        }
        let imageUrl = '';
        if (req.file) {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const newBook = {
            title,
            author,
            publishYear,
            image: imageUrl,
            userId: req.userId, 
        };
        const book = await Book.create(newBook);
        return res.status(201).send(book);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});

router.get('/', authenticate, async (req, res) => {
    try {
        const books = await Book.find({ userId: req.userId });  // Filter by userId
        return res.status(200).json({
            count: books.length,
            data: books,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send({ message: error.message });
    }
});


router.get('/:id',async (request,response)=>{
    try {
        const {id}=request.params;
        
        const book = await Book.findById(id);
        return response.status(200).json(book);
        
    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });


    }

})
router.put('/:id',async (request,response)=>{
    try {
        if (
            !request.body.title ||
            !request.body.author ||
            !request.body.publishYear
        ) {
            return response.status(400).send({
                message: "send all required fields: title,author,publishYear",
            });
        }
        const {id}=request.params;
        const result = await Book.findByIdAndUpdate(id, request.body, { new: true });

        if(!result){
            return response.status(400).json({message:'Book not found'});

        }
        return response.status(200).send({message:'Book Updated successfully'});

    } catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });


    }
})
router.delete('/:id', async (request,response)=>{
    try {
        const {id}=request.params;
        const result = await Book.findByIdAndDelete(id);
        if(!result){
            return response.status(400).json({message:'Book not found'});
    } 
    return response.status(200).send({message:'Book deleted successfully'});

    }
    catch (error) {
        console.log(error.message);
        response.status(500).send({ message: error.message });

    }
})

export default router;