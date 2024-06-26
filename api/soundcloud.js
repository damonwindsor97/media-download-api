const express = require('express');
const router = express.Router();
const scdl = require('soundcloud-downloader').default

const fs = require('fs');
const path = require('path')

router.route('/getTitle').post(async (req, res) => {

});

router.route('/getInfo').post(async (req, res) => {
    try {
        const soundcloudUrl = req.body.link;

        const info = await scdl.getInfo(soundcloudUrl)

        res.send(info)
        console.log(info)
    } catch (error) {
        console.log(error)
        res.status(500).send("Error getting info")
    }
});

router.route('/downloadMp3').post(async (req, res) => {


});

module.exports = router;