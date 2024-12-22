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
    auth: 'customer-damonwindsor97_AiLaW:Chopper1997=',
    // ignore certificate
    rejectUnauthorized: false 
});

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1734852308.549776,
        "hostOnly": false,
        "httpOnly": true,
        "name": "YTSESSION-1b",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "ANPz9Kjskqu4JSwEm11ZkzAuH6LqBgVGEbYEpzRhuB9p91+iymQyN6CGjbZGF5NW+qI8X9N5P/zTboTcU6Vp7KO9lqTGaaezzNhQBFc="
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.954193,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000rggUSrnE8Vr7uSslAFolsWeSawSEV6lmWPoz0YkxwJ_BkXv8G1mWaVu6SJseCRxpi15-AwACgYKAfYSARESFQHGX2MiIAmZRBkTrKmcWaJTQWDRtRoVAUF8yKoFqDOgHSHS6yGOkoF2boTK0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1734853873.413759,
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
        "expirationDate": 1766388183.877134,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjIB7wV3sXDJKckDKXEfKqOiy0NiwZAHl0xZsk5HQoFMju1XwooA51hTfes9I3YZ3m-L1hAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.954027,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "pScGN1PN-TfTfJly/ANa4e3I9vf6_H--mf"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1766388209.096446,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzX2PDDaIYxeVwTXzFw-6ZOi324mw7LarvCaXB0x3BFfYEAo2oEoRbNgs-yHis4Ugde9"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.953991,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "ALKpQMpqneoCQttGr"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.954042,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "pScGN1PN-TfTfJly/ANa4e3I9vf6_H--mf"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.954176,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000rggUSrnE8Vr7uSslAFolsWeSawSEV6lmWPoz0YkxwJ_BkXv8JXZFuYtaUD7hDnf1wylViwACgYKAfMSARESFQHGX2Mix_Gzac0O1SmMdsSKnGYw1BoVAUF8yKoKaHTKKW6YndUwd4s23T0G0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.954057,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "pScGN1PN-TfTfJly/ANa4e3I9vf6_H--mf"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1766388209.096474,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzXo7dfzLlJ4ldxARCZDjYx3s3bhrb53V0-gAjSY3cU6Tnp8B1jJgC6B0MyupnVl8QUE1Q"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1766388183.877153,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjIB7wV3sXDJKckDKXEfKqOiy0NiwZAHl0xZsk5HQoFMju1XwooA51hTfes9I3YZ3m-L1hAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412188.549764,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRQIgQ66cgtZ48blxDwLiXtg7neJtuygPLlcefRqhY2yx9o0CIQDJ-kgKTxsDJRYqmbRtVzJin2oZjhyHMrHjkhtCQ0y9ig:QUQ3MjNmd21kdXhWOW9ZYkxySU9mV013SGw1RG5tNVE0Nllya3YzNVI4am9jdlEzdGpYVVVDUnVTeEV4S2xLN0xSX1lLU0x2cm5ZdGxieEFhMGRnWUdZSEllOXVtVWRnVVgwcW5BeFdzTDdHb20ySTAxR2N1ajlMQVRCSHI4U0lhNjdIaDJMcXVmMnJqN0wxa3VPREFacVdjelN1MUo0R2VR"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1769412207.617883,
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

const ytdlAgent = ytdl.createProxyAgent({uri: 'http://customer-damonwindsor97_AiLaW:Yarrambat1997_@pr.oxylabs.io:7777'}, cookies)

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

            const info = ytdl.getBasicInfo(videoUrl, {ytdlAgent})
            console.log(info)
            res.send(info)

        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },

    async downloadMp4(req, res, next) {
        let ffmpegProcess;
        let cleanupFiles = [];
    
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
    
        const cleanup = () => {
            if (ffmpegProcess) {
                try {
                    ffmpegProcess.kill('SIGKILL');
                } catch (error) {
                    console.error('[YT>MP4] Error killing ffmpeg process:', error);
                }
            }
            
            cleanupFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlink(file, (error) => {
                        if (error) console.error(`Error deleting file ${file}:`, error);
                        else console.log(`File deleted: ${file}`);
                    });
                }
            });
        };
    
        try {
            const videoUrl = req.body.link;
            console.log('[YT>MP4] YouTube link obtained');
            
            const options = {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    }
                }
            };
    
            if (!ytdl.validateURL(videoUrl)) {
                return res.status(400).send('Invalid YouTube URL');
            }
    
            const info = await ytdl.getInfo(videoUrl, options);
            const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
            console.log(`[YT>MP4] Video info obtained: ${title}`);
    
            const ffmpegPath = path.join(tempDir, `${title}_${Date.now()}.mp4`);
            cleanupFiles.push(ffmpegPath);
    
            console.log('[YT>MP4] Beginning ffmpeg process');
            ffmpegProcess = cp.spawn(ffmpeg, [
                '-loglevel', 'warning',
                '-i', 'pipe:3',
                '-i', 'pipe:4',
                '-map', '0:v',
                '-map', '1:a',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-strict', 'experimental',
                ffmpegPath
            ], {
                windowsHide: true,
                stdio: [
                    'pipe', 'pipe', 'pipe', 'pipe', 'pipe'
                ]
            });
    
            console.log('[YT>MP4] Starting video download');
            const videoStream = ytdl(videoUrl, { ...options, quality: 'highestvideo', filter: 'videoonly' });
    
            console.log('[YT>MP4] Starting audio download');
            const audioStream = ytdl(videoUrl, { ...options, quality: 'highestaudio', filter: 'audioonly' });
    
            videoStream.pipe(ffmpegProcess.stdio[3]);
            audioStream.pipe(ffmpegProcess.stdio[4]);
    
            videoStream.on('error', (error) => {
                console.error('[YT>MP4] Video stream error:', error);
                cleanup();
                if (!res.headersSent) {
                    res.status(500).send('Error downloading video stream');
                }
            });
    
            audioStream.on('error', (error) => {
                console.error('[YT>MP4] Audio stream error:', error);
                cleanup();
                if (!res.headersSent) {
                    res.status(500).send('Error downloading audio stream');
                }
            });
    
            ffmpegProcess.stderr.on('data', (data) => {
                const message = data.toString();
                if (!message.includes('Output #0')) {
                    console.error('[YT>MP4] FFmpeg Error:', message);
                }
            });
    
            ffmpegProcess.on('close', (code) => {
                console.log(`[YT>MP4] FFmpeg process closed with code ${code}`);
                
                if (code === 0 && fs.existsSync(ffmpegPath)) {
                    console.log(`[YT>MP4] Video successfully converted: ${title}`);
                    res.download(ffmpegPath, `${title}.mp4`, (error) => {
                        if (error) {
                            console.error('[YT>MP4] Download error:', error);
                            if (!res.headersSent) {
                                res.status(500).send('Error downloading file');
                            }
                        }
                        cleanup();
                    });
                } else {
                    console.error('[YT>MP4] FFmpeg process failed');
                    if (!res.headersSent) {
                        res.status(500).send('Error processing video');
                    }
                    cleanup();
                }
            });
    
            ffmpegProcess.on('error', (error) => {
                console.error('[YT>MP4] FFmpeg process error:', error);
                if (!res.headersSent) {
                    res.status(500).send('Error processing video');
                }
                cleanup();
            });
    
        } catch (error) {
            console.error('[YT>MP4] Internal server error:', error);
            if (!res.headersSent) {
                res.status(500).send('Internal server error.');
            }
            cleanup();
        }
    }
}
