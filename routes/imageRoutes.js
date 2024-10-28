const express = require('express');
const router = express.Router();

const imageController = require('../controllers/imageController')

module.exports = () => {

    router.get('/test', imageController.testCallback)

    
}