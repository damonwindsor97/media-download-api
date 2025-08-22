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

const DiscordBot = require('./server/DiscordBot.js');
const botProtection = require('./middleware/botProtection.js')
const anonToken = require('./middleware/anonToken.js')

const app = express();

app.use(botProtection)
const server = http.createServer(app);


app.use(cors({ 
    origin: ["https://convertforyou-website-prod.onrender.com", "https://www.convertforyou.com"],  
        methods: ["GET", "POST", "DELETE"],
    credentials: true
}));


// app.use(cors({ 
//     origin: "http://localhost:5173",  
//     methods: ["GET", "POST", "DELETE"],
//     credentials: true,
// }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('trust proxy', 1);
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
    res.json({ token: req.anon_token, message: 'Working'})
})

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// API routes
const routes = require('./routes/routes.js');
app.use('/api/v2-2', routes());


// Redirect route - This must be after API routes
app.get('/:slug', urlController.getSlug);

app.get('/', (req, res) => {
    res.send('Media Download API is live');
});

app.use((req, res) => {
    res.status(404).send('endpoint not available');
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