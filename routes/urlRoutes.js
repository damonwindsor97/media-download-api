const express = require('express');
const router = express.Router()

const UrlController = require('../controllers/urlController.js')

module.exports = () => {
    router.get('/test', UrlController.testCallback)

    router.get('/dbCall', UrlController.dbCall)

    router.post('/shorten', UrlController.shortUrl)

    router.get('/:slug', UrlController.getSlug)

    return router
}