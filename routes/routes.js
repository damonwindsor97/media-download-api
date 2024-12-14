const express = require('express');
const router = express.Router();

const soundcloudRoutes = require('../routes/soundcloudRoutes.js')
const urlRoutes = require('../routes/urlRoutes.js');
const youtubeRoutes = require('../routes/youtubeRoutes.js')
const spotifyRoutes = require('../routes/spotifyRoutes.js')

module.exports = () => {
    router.get('/', (req, res, next) => {
        res.send('A proper routed system')
    })

    router.use('/soundcloud', soundcloudRoutes());

    router.use('/youtube', youtubeRoutes())

    router.use('/youtube', youtubeRoutes())

    router.use('/spotify', spotifyRoutes())


    return router
}