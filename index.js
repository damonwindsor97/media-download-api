const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

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

// Ensure the existence of the temp directory
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
    console.log('Temp directory created successfully.');
}

const routes = require('./routes/routes.js')
app.use('/api', routes());

const port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});