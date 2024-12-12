import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from './routes/booksRoute.js';
import cors from 'cors';
import userRoute from './routes/userRoute.js'




const app = express();
app.use(express.urlencoded({extended:true}))
app.use('/uploads',express.static('uploads'))
app.use(express.json());


app.use(cors())

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('welcome to mern stack tutorial');
});
app.use('/books',booksRoute);
app.use('/user',userRoute);

mongoose.connect(mongoDBURL)
    .then(() => console.log('Connected to MongoDB Atlas!'),
        app.listen(PORT, () => {
            console.log(`App is listening to port:${PORT}`);
        }))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));


