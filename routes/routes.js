const express = require('express');
const router = express.Router();

const soundcloudRoutes = require('../routes/soundcloudRoutes.js')

module.exports = () => {
    router.get('/', (req, res, next) => {
        res.send('A proper routed system')
    })

    router.use('/soundcloud', soundcloudRoutes());

    return router
}