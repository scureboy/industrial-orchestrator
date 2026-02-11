const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const stakeholderRoutes = require('./routes/stakeholders');
const interactionRoutes = require('./routes/interactions');
const documentRoutes = require('./routes/documents');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users'); // Added for users route

app.use('/api/auth', authRoutes);
app.use('/api/stakeholders', stakeholderRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes); // Added users route
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
