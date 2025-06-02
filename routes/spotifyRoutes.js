const express = require('express')
const router = express.Router()

const SpotifyController = require('../controllers/spotifyController')

module.exports = () => {

    router.get('/test', SpotifyController.testCallback)

    router.post('/info', SpotifyController.getTitle)

    router.post('/playlistInfo', SpotifyController.getPlaylist)

    router.post('/downloadMp3', SpotifyController.downloadMp3)

    return router
}