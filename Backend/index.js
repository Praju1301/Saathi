// Import and configure dotenv FIRST
import dotenv from 'dotenv';
dotenv.config();

// Now, import other packages
import express from 'express';
import cors from 'cors';

// Import local modules
import connectDB from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

// Import Routers
import authRoutes from './src/routes/authRoutes.js';
import interactionRoutes from './src/routes/interactionRoutes.js'; // <-- Correct import
import routineRoutes from './src/routes/routineRoutes.js';
import progressRoutes from './src/routes/progressRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import contentRoutes from './src/routes/contentRoutes.js';

connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/interact', interactionRoutes); // <-- Use the router
app.use('/api/routine', routineRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/content', contentRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('Sathi API is running...');
});

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});