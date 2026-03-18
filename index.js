require('dotenv').config()
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs')
const path = require('path')
const http = require('http');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const urlController = require('./controllers/urlController.js')
const DiscordBot = require('./server/DiscordBot/DiscordBot.js');
const botProtection = require('./middleware/botProtection.js')
const anonToken = require('./middleware/anonToken.js')

const app = express();
const server = http.createServer(app);

// Trust proxy MUST come before other middleware
app.set('trust proxy', 1);

// CORS must come BEFORE botProtection to handle preflight requests
// Dynamic CORS configuration for both dev and production
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173', 
            'https://convertforyou-website-prod.onrender.com',
            'https://www.convertforyou.com',
        ].filter(Boolean);

        if (!origin) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`[CORS] Blocked origin: ${origin}`);
            // In production, you want to allow the request but log it
            // callback(null, true); // Uncomment this to allow but log
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['set-cookie'],
    maxAge: 86400 
};

app.use(cors(corsOptions));

app.use(botProtection);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(anonToken);

DiscordBot();

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

app.get('/test', async (req, res) => {
    res.json({ 
        token: req.anon_token, 
        message: 'Working',
        origin: req.headers.origin,
        cookie: req.cookies?.anon_token ? 'Cookie present' : 'No cookie'
    })
})

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

const routes = require('./routes/routes.js');
app.use('/api/v2-2', routes());

app.get('/server/token', async (req, res) => {
    const urlController = require('./controllers/urlController.js');
    return urlController.getAnonToken(req, res);
});

app.get('/:slug', urlController.getSlug);

app.get('/', (req, res) => {
    res.send('Media Download API is live');
});

app.use((req, res) => {
    res.status(404).send('endpoint not available');
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({ error: 'Internal Server Error' });
    } else {
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message,
            stack: err.stack 
        });
    }
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Base URL: ${process.env.URL}`);
    console.log(`Server listening on port ${port}`);
    console.log(`CORS enabled for: ${process.env.NODE_ENV === 'production' ? 'Production origins' : 'Development origins'}`);
});