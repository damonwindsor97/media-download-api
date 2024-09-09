const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const http = require('http')
const { Server } = require('socket.io');
const { youtubeRouter, progressEmitter } = require("./api/youtube.js");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    //  LOCAL TESTING -------------------
    // cors: {
    //   origin: "http://localhost:5173",  
    //   methods: ["GET", "POST"],
    //   credentials: true
    // }

    // LIVE DEV TESTING ----------------------
    cors: {
        origin: "https://dev-linkify-gg.onrender.com",  
        methods: ["GET", "POST"],
        credentials: true
    }
  

    // LIVE ----------------------
    // cors: {
    //   origin: "https://linkify.gg/",  
    //   methods: ["GET", "POST"],
    //   credentials: true
    // }
})
  
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

const youtubeRoutes = require('./api/youtube.js')
app.use("/youtube", youtubeRouter);

const soundcloudRoutes = require('./api/soundcloud.js')
app.use("/soundcloud", soundcloudRoutes)

const spotifyRoutes = require('./api/spotify.js');
app.use("/spotify", spotifyRoutes)

// Progress Bar Emitter Jazz
io.on('connection', (socket) => {
    console.log('A client connected');

    const progressListener = (percent) => {
        socket.emit('downloadProgress', percent);
    };

    const completeListener = () => {
        socket.emit('downloadComplete');
    };

    progressEmitter.on('progress', progressListener);
    progressEmitter.on('complete', completeListener);

    socket.on('disconnect', () => {
        progressEmitter.off('progress', progressListener);
        progressEmitter.off('complete', completeListener);
        console.log('A client disconnected');
    });
});

const port = process.env.PORT || 5000;
server.listen(port, function () {
    console.log(`Server started on port: ${port}`);
});