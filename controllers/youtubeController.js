const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process')

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

            const { videoId } = req.body; 
            console.log(`Obtained video ID: ${videoId}`);
          
            if (!videoId) {
                return res.status(400).json({ error: 'YouTube video ID is required' });
            }
            
            // options / settings for the API
            const options = {
                method: 'GET',
                url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
                params: { id: videoId },
                headers: {
                    'x-rapidapi-key': process.env.YOUTUBE_MP4_API_KEY,
                    'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                }
            };
    
            console.log('Making Request')
            const response = await axios.request(options);
            const title = (response.data.title);

            res.send(title)

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },
