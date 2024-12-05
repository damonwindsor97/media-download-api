const express = require('express')
const router = express.Router()

const SpotifyController = require('../controllers/spotifyController')

module.exports = () => {

    router.get('/test', SpotifyController.testCallback)

    router.post('/info', SpotifyController.getTitle)

    router.post('/playlistInfo', SpotifyController.getPlaylist)

    return router
}