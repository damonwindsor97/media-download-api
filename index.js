const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const urlController = require('./controllers/urlController.js')
const fs = require('fs')
const path = require('path')

const app = express();

app.use(cors({ 
    origin: "*",  
    methods: ["GET", "POST"],
    credentials: true
    }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

require('dotenv').config();

// Making sure we have a temp folder
const tempDir = path.join(__dirname, 'temp');
if(!fs.existsSync(tempDir)){
    fs.mkdirSync(tempDir);
    console.log('Temp directory successfully created')
}
console.log(`Temp directory: ${tempDir}`);

// Database connection
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

const fileUpload = require('express-fileupload');

app.use(fileUpload({
    limits: { fileSize: 200 * 1024 * 1024 }, 
    useTempFiles: true,
    tempFileDir: '../temp/videoUploads',
}));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// API routes
const routes = require('./routes/routes.js');
app.use('/api', routes());

// Redirect route - This must be after API routes
app.get('/:slug', urlController.getSlug);


app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Base URL: ${process.env.URL}`);
    console.log(`Server listening on port ${port}`);
});