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
        "expirationDate": 1757987058.967057,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 1
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967089,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cr_Dycb8-Vl4KfPsFRmHC_QACgYKAVUSARASFQHGX2MiNfnaWu23Sa5NEyFWGawPgBoVAUF8yKrf7HFQvIKZHxtdJSS0AeLO0076",
        "id": 2
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850101,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzV3mbr-FYoU63H0_mh_beGcXaxW37XRF9rb5rqYfNhW8H_TlSlwM4C2FaOV1k51f3Gq",
        "id": 3
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963058.966946,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjEBUFGohxMMo5M0zzeVMYygh1uFLIZAfdYnoCrAus5G01n2aaJWGMawyVgemQEGQGmVEAA",
        "id": 4
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967069,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 5
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967099,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cdpDmid44NT853hwI7KNU8QACgYKAZwSARASFQHGX2MiXGJuEHNcsk0Ok2ZcsXkVBBoVAUF8yKoI_bju_tAUf0HqGo7BJFdv0076",
        "id": 6
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850123,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzW1v-sSdPMGfXa-MqIi65XNf2AzJS-Zeu2MMQzUs8TSOpaXxx970Kb3Q0WbJGs9zz7A",
        "id": 7
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963058.967002,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjEBUFGohxMMo5M0zzeVMYygh1uFLIZAfdYnoCrAus5G01n2aaJWGMawyVgemQEGQGmVEAA",
        "id": 8
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967036,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "tyldVkmzk1i1LLmg/AVooB68nK-5qQ_w5x",
        "id": 9
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1723428743.340725,
        "hostOnly": false,
        "httpOnly": true,
        "name": "GPS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "1",
        "id": 10
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967016,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "Ai4-UNOGshSuT3OkL",
        "id": 11
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987059.785653,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AFmmF2swRQIgOutHwcM6yhqYQEtAZadO29UvivsrOHuVzuYwwMjZH4YCIQCcyWLI634QOVXI--9MAsRJi4_vX9LFHkdQ43fbbyWBVg:QUQ3MjNmeksxNVhYeURWVHh3SEItTmNtM1dmdTk4YjFWeFlRdkhfVjZkRFVmNFk4ejNjVFIwSlhmMmdFTzNiZ0t0NEl6UDJXUmZRSlk5Mi1UbXhqMlAzeEUycEZIdzBHb1ZHVUxrSUh3TDNCVmZKQjVfeTdaUzRuZnNWanBiQ0ZZUXhTSGRiWEpaejJFaDd4OTZNMHg0ZU5abnQtRlpiVE9B",
        "id": 12
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987065.692163,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "tz=Australia.Sydney",
        "id": 13
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967047,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 14
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967078,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cjBY1tDt92IlM6kO_dg3glgACgYKAcoSARASFQHGX2Minx9E5fvYQpPyl0kmUoUYYxoVAUF8yKoAml6V-CMoXSMMZbAvm30H0076",
        "id": 15
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850025,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzWrYh9Tv_tPeVFeJTRW6j79fWcMoENjcFZGthD-PN1aJKHmvkPL1sVunPU6fbf7OpTt",
        "id": 16
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967027,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "A9HpobxuBud1fTynA",
        "id": 17
    }
]
const proxyUrl = 'http://customer-damonwindsor97_AiLaW:Chopper1997@pr.oxylabs.io:7777'
const ytdlAgent = ytdl.createProxyAgent({ uri: proxyUrl}, cookies);

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
    
            const info = await ytdl.getInfo(videoUrl, {  });
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
            const ytdlVideoStream = ytdl(videoUrl, { quality: 'highestvideo' })

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
