const express = require('express');
const router = express.Router();

const ServerController = require('../controllers/serverController')

module.exports = () => {

    router.get('/token', ServerController.getAnonToken)

    router.get('/anonUtilHistory', ServerController.getAnonHistory)

    router.get('/genSignedUrl', ServerController.generateSignedUrl)

    router.get('/downloadSignedUrl', ServerController.downloadSignedUrl);

    router.delete('/deleteS3Object', ServerController.deleteSignedUrl)

    return router
}