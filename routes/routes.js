const express = require('express');
const router = express.Router();

const soundcloudRoutes = require('./soundcloudRoutes.js')
const youtubeRoutes = require('./youtubeRoutes.js')
const urlRoutes = require('./urlRoutes.js');
const videoRoutes = require('./videoRoutes.js')


module.exports = () => {
    router.get('/', (req, res, next) => {
        res.send('A proper routed system')
    })

    router.use('/soundcloud', soundcloudRoutes());

    router.use('/youtube', youtubeRoutes())

    router.use('/url', urlRoutes());

    router.use('/video', videoRoutes());

    return router
}