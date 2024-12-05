const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process')

const playDl = require('play-dl')


module.exports = {
    async testCallback(req, res, next){
        try {
            res.send('YouTube endpoint hit');
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    },

    async getTitle(req, res, next){
        try {
            const videoUrl = req.body.link
            const info = await playDl.video_info(videoUrl)

            console.log(info.format)

            res.send('setn')
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },

};