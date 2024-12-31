
const { ytmp3, ytmp4 } = require('ruhend-scraper')
const fetch = require('node-fetch')


module.exports = {
    async testCallback(req, res, next){
        try {
            const videoUrl = req.body.link

            const data = await ytmp3(videoUrl)

            console.log(data)
            res.status(200).send( data);
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    },

    async getInfo(req, res, next){
        try {
            const videoUrl = req.body.link

            const response = await ytmp3(videoUrl);
            const data = response;

            console.log(data)
            res.status(200).send(data);
        } catch (error) {
            
        }
    },

    async getTitle(req, res, next){
        try {
            const videoUrl = req.body.link

            const data = await ytmp3(videoUrl)

            console.log(data.title)
            res.status(200).send( data.title);

        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    async downloadMp3(req, res, next) {
        try {
            const videoUrl = req.body.link;
            console.log('[YT>MP3] Link obtained')
    
            console.log('[YT>MP3] Awaiting response from scraper...')
            const response = await ytmp3(videoUrl);
            const audioUrl = response.audio;
            const audioTitle = response.title;
    
            console.log('[YT>MP3] Fetching response from audio URL...')
            const audioResponse = await fetch(audioUrl);
            if (!audioResponse.ok) {
                throw new Error('Failed to fetch audio file');
            }
    
            console.log('[YT>MP3] Setting Headers...')
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${audioTitle}.mp3"`);
            res.setHeader('X-Audio-Title', audioTitle);
            
            console.log('[YT>MP3] Awaiting audio response buffer...')
            const audioBuffer = await audioResponse.buffer();
    
            console.log('[YT>MP3] Sending audio to user...')
            res.status(200).send(audioBuffer);
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    async downloadMp4(req, res, next){
        try {
            const videoUrl = req.body.link;
            console.log('[YT>MP4] Link obtained')
    
            console.log('[YT>MP4] Awaiting response from scraper...')
            const response = await ytmp4(videoUrl);
            const dataUrl = response.video;
            const videoTitle = response.title;
    
            console.log('[YT>MP4] Fetching response from video URL...')
            const audioResponse = await fetch(dataUrl);
            if (!audioResponse.ok) {
                throw new Error('Failed to fetch video file');
            }
    
            console.log('[YT>MP4] Setting Headers...')
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp3"`);
            res.setHeader('X-Audio-Title', videoTitle);
            
            console.log('[YT>MP4] Awaiting video response buffer...')
            const audioBuffer = await audioResponse.buffer();
    
            console.log('[YT>MP4] Sending video to user...')
            res.status(200).send(audioBuffer);
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }

}