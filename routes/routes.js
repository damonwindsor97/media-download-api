const express = require('express');
const router = express.Router();

const soundcloudRoutes = require('../routes/soundcloudRoutes.js')
const urlRoutes = require('../routes/urlRoutes.js');
const youtubeRoutes = require('../routes/youtubeRoutes.js')


module.exports = () => {
    router.get('/', (req, res, next) => {
        res.send('A proper routed system')
    })

    router.use('/soundcloud', soundcloudRoutes());

    router.use('/url', urlRoutes());

    router.use('/youtube', youtubeRoutes())

    return router
}