const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const urlController = require('./controllers/urlController.js')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io')

const app = express();

// Create http server, initialize socket.io with the http server
const server = http.createServer(app);

// CHANGE ORIGINS TO FRONTEND ADDRESS

const io = new Server(server, {
    cors: {
        origin: "https://dev-linkify-gg.onrender.com",
        methods: ["GET", "POST"],
        credentials: true
    }
})
app.use(cors({ 
    origin: "https://dev-linkify-gg.onrender.com",  
    methods: ["GET", "POST"],
    credentials: true
}));
// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:5173",
//         methods: ["GET", "POST"],
//     }
// })
// app.use(cors({ 
//     origin: "http://localhost:5173",  
//     methods: ["GET", "POST"],
// }));


// make io accessable
app.set('io', io)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('trust proxy', 1);

require('dotenv').config();

// event handlers for socket
io.on('connection', (socket) => {
    console.log('Socket Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Socket Client disconnected:', socket.id);
    });
});

// Making sure we have a temp folder
const tempDir = path.join(__dirname, 'temp');
if(!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir);
    console.log('Temp directory successfully created')
}
console.log(`Temp directory: ${tempDir}`);

// Mongo Database connection
const connectToMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected to:', mongoose.connection.db.databaseName);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};
connectToMongo();

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// API routes
const routes = require('./routes/routes.js');
app.use('/api/v1', routes());

// Redirect route - This must be after API routes
app.get('/:slug', urlController.getSlug);

app.get('/', (req, res) => {
    res.send('Media Download API is live');
});

app.use((req, res) => {
    res.status(404).send('endpoint no available');
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});


const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Base URL: ${process.env.URL}`);
    console.log(`Server listening on port ${port}`);
});