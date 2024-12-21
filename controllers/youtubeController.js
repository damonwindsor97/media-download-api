const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cp = require('child_process')

const ytdl = require('@distube/ytdl-core')
const ffmpeg = require('ffmpeg-static');
const { Agent } = require('https'); 

const agent = new Agent({
    host: 'pr.oxylabs.io',
    port: 7777,
    auth: 'customer-damonwindsor97_AiLaW:Chopper1997',
    // ignore certificate
    rejectUnauthorized: false 
});

const cookies = [
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703191,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-3PSID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "g.a000rgjaiDdIeRXrVB-gHiM6_uikBEo63oSNBLn2BSYz0Amd12heYwgKoJWaXFQoUswJH-UngwACgYKAdkSARcSFQHGX2Mi4BQTZnxUeASkgO-DDlj_zxoVAUF8yKpPIvKGTMRt2Msxe-gKNbGb0076"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1734782117.201077,
            "hostOnly": false,
            "httpOnly": true,
            "name": "GPS",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "1"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1766316441.703024,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-1PSIDTS",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "sidts-CjIB7wV3sZu9FRFOqD2xtZncZA3KuMk_wwah4QYPVJHhXR6yTITATLcplk0yWy0VxS7qtBAA"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703133,
            "hostOnly": false,
            "httpOnly": false,
            "name": "SAPISID",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "CY9AhI7GG3PTpJ2C/AccliOgsr34f8HC6E"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1766316455.932277,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-1PSIDCC",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "AKEyXzXU-O7dlHC5IHKskZ5oJkX4gg4PifPIa_PSsVDH4QtRh3nbymKGAzQdnUAXuuxY1oszMQ"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703109,
            "hostOnly": false,
            "httpOnly": true,
            "name": "SSID",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "Au390LnI9Hb8i7of6"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703144,
            "hostOnly": false,
            "httpOnly": false,
            "name": "__Secure-1PAPISID",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "CY9AhI7GG3PTpJ2C/AccliOgsr34f8HC6E"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703177,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-1PSID",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "g.a000rgjaiDdIeRXrVB-gHiM6_uikBEo63oSNBLn2BSYz0Amd12he0J9NVeroA1L2XO0DBdx5TwACgYKARISARcSFQHGX2Mid8J0Ihbrx9FWP8o_S3dEpRoVAUF8yKrpsi3fu-rzpw2DKu8jHTIl0076"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340441.703154,
            "hostOnly": false,
            "httpOnly": false,
            "name": "__Secure-3PAPISID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "CY9AhI7GG3PTpJ2C/AccliOgsr34f8HC6E"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1766316455.932311,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-3PSIDCC",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "AKEyXzVdn2hCmdL5KAFteLza6fJUXFtYPARTY1LlS3obc8wnNB2QApauNemB-u9nB2p4TbsK"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1766316441.703081,
            "hostOnly": false,
            "httpOnly": true,
            "name": "__Secure-3PSIDTS",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "sidts-CjIB7wV3sZu9FRFOqD2xtZncZA3KuMk_wwah4QYPVJHhXR6yTITATLcplk0yWy0VxS7qtBAA"
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340442.68699,
            "hostOnly": false,
            "httpOnly": true,
            "name": "LOGIN_INFO",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "AFmmF2swRQIhAJpRebYd2jZeFb8I6cHQY7uGUTP-oe583xmAf_xVP970AiByB8hQU0dvz-y7T22IUscWHT2cdH2GYWfisSpAQRWQdA:QUQ3MjNmeVpKM2h0UzNkYTdvUjNoaHJTTmY0RVU4bW4wTVFhTVlFeFBlZGFwT3NlVF94T29wMFk2QXNWc3U5YUxJTnBTQnFMXzRtV0otRE9tZ1ZudkxQVUYxcGxXc1paUTJhR05kd2x6WjR0VFVsUm91aDNVdlppQWN0OF9mSktFWG1IaEpoMEhPVEZUQ1BYdHVsVC10TlBKN3hzdHBONTJaT0Q3OVEtNjBwaThsMGIyNzRDcUpRUjBaWkNHMHhweEs2bnhrWTMtclJndzdtMXpuekNNdUxJWkVsdjlrby1YZw=="
        },
        {
            "domain": ".youtube.com",
            "expirationDate": 1769340445.46901,
            "hostOnly": false,
            "httpOnly": false,
            "name": "PREF",
            "path": "/",
            "sameSite": null,
            "secure": true,
            "session": false,
            "storeId": null,
            "value": "tz=Australia.Sydney"
        }
]

const ytdlAgent = ytdl.createAgent(cookies);

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

    async downloadMp4(req, res, next){
        let ffmpegProcess;
        // array to store paths of temp files
        let cleanupFiles = [];
    
        // Cleanup function to kill the process and delete all temp files
        const cleanup = () => {
            // if the ffmpeg process exists, stop it immediantly
            if (ffmpegProcess) {
                ffmpegProcess.kill('SIGKILL');
            }
            
            // Then, go over all files with cleanupFiles array, deleting them
            cleanupFiles.forEach(file => {
                fs.unlink(file, (error) => {
                    if (error) console.error(`Error deleting file ${file}:`, error);
                    else console.log(`File deleted: ${file}`);
                });
            });
        };
    
        // Adding event listener to the req
        // 'close' event is emitted when user closes connection before response is sent back (from refreshing page etc.)
        req.on('close', cleanup);
    
        try {
            const videoUrl = req.body.link;
            console.log('[YT>MP4] YouTube link obtained');
            // Validate URL
            if (!ytdl.validateURL(videoUrl)) {
                return res.status(400).send('Invalid YouTube URL');
            }
            console.log('[YT>MP4] YouTube link Valid');
    
            const info = await ytdl.getInfo(videoUrl, {ytdlAgent} );
            const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
            console.log(`[YT>MP4] Video info obtained: ${title}`);
    
            const tempDir = path.join(process.cwd(), 'temp');
            const ffmpegPath = path.join(tempDir, `${title}_${Date.now()}.mp4`);
            cleanupFiles.push(ffmpegPath);
    
            console.log('[YT>MP4] Beginning ffmpeg process');
            ffmpegProcess = cp.spawn(ffmpeg, [
                '-loglevel', '8', '-hide_banner',
                '-progress', 'pipe:3',
                '-i', 'pipe:4',
                '-i', 'pipe:5',
                '-map', '0:a',
                '-map', '1:v',
                '-c:v', 'copy',
                ffmpegPath,
            ], {
                windowsHide: true,
                stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
            });
    
            // ytdl jazziness
            console.log("[YT>MP4] Initiating process with ytdl");
            const ytdlVideoStream = ytdl(videoUrl, { quality: 'highestvideo', ytdlAgent })

            .on('error', (error) => {
                console.error('[YT>MP4] Error in ytdl:', error);
                cleanup();
                res.status(500).send('Error downloading video');
            });
            ytdlVideoStream.pipe(ffmpegProcess.stdio[5])
            console.log("[YT>MP4] Video received, now getting audio...")
            ytdl(videoUrl, { quality: 'highestaudio', ytdlAgent }).pipe(ffmpegProcess.stdio[4]);
            console.log("[YT>MP4] Video and Audio received")
            
            // Error Handling, for if user leaves unexpectedly
            // 'code' = exit code or exit status
            ffmpegProcess.on('close', (code) => {
                console.log(`[YT>MP4] ffmpeg process closed with code ${code}`);
                if (code === 0) {
                    console.log(`[YT>MP4] Video successfully converted: ${title}`);
                    res.download(ffmpegPath, `${title}.mp4`, (error) => {
                        if (error) {
                            console.error('[YT>MP4] Download error:', error);
                            res.status(500).send('Error downloading file');
                        }
                        cleanup();
                    });
                } else {
                    console.error(`[YT>MP4] ffmpeg process exited with code ${code}`);
                    res.status(500).send('Error processing video');
                    cleanup();
                }
            });
            // Standard Error handling
            ffmpegProcess.on('error', (error) => {
                console.error('[YT>MP4] ffmpegProcess error:', error);
                res.status(500).send('Internal server error during video processing');
                cleanup();
            });
    
        } catch (error) {
            console.error('[YT>MP4] Internal server error:', error);
            res.status(500).send('Internal server error.');
            cleanup();
        }
    },
}
