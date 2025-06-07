import express from 'express';
import mongoose from 'mongoose';       
import userRoutes from './routes/userRoutes.js'; // Make sure this file exists: ./routes/userRoutes.js
import converation from './routes/conversationRoutes.js'; // Make sure this file exists: ./routes/conversationRoutes.js
import dotenv from "dotenv"; 
import path from 'path';
import { Server } from 'socket.io';
import socketHandler from './socket.js'; // Make sure this file exists: ./socket.js


dotenv.config();

const app = express();
app.use(express.json());

// Middleware to serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//database connection

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("Database connected successfully"))
.catch((err)=> console.log("Database connection failed", err));

app.get('/', (_, res) => {
  res.send('WhatsApp Backend is running');
});

app.use('/api/users', userRoutes); // Use user routes
app.use('/api/conversations', converation); // Use conversation routes

const server=app.listen(5000, () => {
  console.log('WhatsApp Backend is running on port 5000');
});

const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity, adjust as needed
    methods: ['GET', 'POST'],
  },
});

socketHandler(io); // Initialize socket.io with the handler