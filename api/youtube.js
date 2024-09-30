const express = require('express')
const router = express.Router();

const fs = require('fs')
const path = require('path')
const cp = require('child_process')
require('dotenv').config();

// We are using a variant of ytdl-core that has quick fixes before the main repo implements them
// Once change is made to main repo, we can then install and replace ytdl-core where the @distube is instead 
const ytdl = require('@distube/ytdl-core')
const ffmpeg = require('ffmpeg-static');


const EventEmitter = require('events');
const progressEmitter = new EventEmitter();

const { Agent } = require('https'); 

const agent = new Agent({
    host: process.env.PROXY_HOST,
    port: process.env.PROXY_PORT,
    auth: process.env.PROXY_AUTH,
    // ignore certificate
    rejectUnauthorized: false 
});

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.66526,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000ogjBs48XjnX2G3n7oQ_UimRciMrw46Z-cqh1MAXCB9lOFpOVEKS_tWEt-loa4EO0RYVWFAACgYKAUwSARASFQHGX2MiublJyOZxmji5TRma_-P_-BoVAUF8yKpb2xot8TQfWOPbM3yA0rkm0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1727707024.185511,
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
        "expirationDate": 1759241242.665228,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQlrA-BSzmFQxeaNb94qcE-qctovDmYfsag4Vrv9j4DGVKM3zfA-0F9cPkUH2RYgIEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.665293,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "LgA4jqYZeCGOtP7Q/A8TGm5mv11Msq7oEd"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759241249.891699,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzU4HyrddzQy2_gIW3xSU0m4QIKsLPqHy_fGUdx598TxGSpCuhZSJqlftsI32q-LPu1b"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.665279,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AHaIhczHIkSnJKSbS"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.665301,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "LgA4jqYZeCGOtP7Q/A8TGm5mv11Msq7oEd"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.665251,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000ogjBs48XjnX2G3n7oQ_UimRciMrw46Z-cqh1MAXCB9lOFpOVEZVWjzLvApaG_AWvRo2MJgACgYKAcoSARASFQHGX2MiJN38_rZh-9s2ND1leOMBcxoVAUF8yKpXx4tPjFD9swEINscy6PPd0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265242.665308,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "LgA4jqYZeCGOtP7Q/A8TGm5mv11Msq7oEd"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759241249.891719,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzWPXE29nfvTEc-GluShYUDg2R0yAZwyL3qn1azIUCjE2fCxSWq2_NBB7YZJutVuxJTo4w"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759241242.665241,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQlrA-BSzmFQxeaNb94qcE-qctovDmYfsag4Vrv9j4DGVKM3zfA-0F9cPkUH2RYgIEAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265243.356978,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRQIhAJL9JhZ6Ntvo3emb6ZjgPOpw5Bu8wFRxAB_iv7FaCkqUAiAwg7hhJBnVVWrx4k5F3xg6K1mGYZIPe9cPU7eUahp1XQ:QUQ3MjNmd0dkUUk0Wm0zMU1jangxN2xUdE9RNERKTjNlLWhSdTFwUWVVU0hZc19VRFIzRVZ3ODcxbXBUam41blFWQVFuSzZfLWRBdmVnT2hhRGFYNnpXMm5RRUxuOGh6RlFHTGp4MlZqMXo5RG1fYXpleHUxNDJGRXg5Yjd4VFZ5SDdkMkVxaVRrVG1LUmJpUktKSndtZjFFMVRiWHY1R21B"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762265249.670617,
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

const proxyUrl = process.env.PROXY_URL
console.log(`Using proxy: ${proxyUrl}`)

const ytdlAgent = ytdl.createProxyAgent({ uri: proxyUrl }, cookies);

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {
    try {
        if (!agent) {
            return res.status(500).send("Proxy agent not available");
        }

        const videoUrl = req.body.link;
        if(!ytdl.validateURL(videoUrl, {ytdlAgent})){
            console.error(`[Title] Invalid YouTube URL: ${videoUrl}`);
            return res.status(400).json({ error: "Invalid YouTube URL", details: "The provided URL is not a valid YouTube video URL." });
        }

        const info = await ytdl.getInfo(videoUrl, {ytdlAgent})
        const title = info.videoDetails.title;

        res.status(200).send(title)
        
    } catch (error) {
        console.log(error)
    }
})

router.route('/downloadMp4').post(async (req, res) => {
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

        const info = await ytdl.getInfo(videoUrl, { agent });
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
        const ytdlVideoStream = ytdl(videoUrl, { quality: 'highestvideo', agent })
        // PROGRESS BAR
        .on('progress', (chunkLength, downloaded, total) => {
            let percent = (downloaded / total * 100).toFixed(2);
                // Emit our progress bar Emitter
                progressEmitter.emit('progress', parseFloat(percent))
                if(percent >= 100) {
                    progressEmitter.emit('complete')
                }
        })
        .on('error', (error) => {
            console.error('[YT>MP4] Error in ytdl:', error);
            cleanup();
            res.status(500).send('Error downloading video');
        });
        ytdlVideoStream.pipe(ffmpegProcess.stdio[5])
        ytdl(videoUrl, { quality: 'highestaudio', agent }).pipe(ffmpegProcess.stdio[4]);

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
        if (error.response && error.response.status === 429){
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate Limit exceeded.',
                retryAfter: error.response.headers['retry-after'] || 120  // 120 seconds
            })
        } else {
            console.error('[YT>MP4] Internal server error:', error);
            res.status(500).send('Internal server error.');
            cleanup();
        }
    }
});

router.route('/downloadMp3').post(async (req, res) => {    
    try {

        if (!agent) {
            return res.status(500).json({ error: "Proxy Agent not available", details: "The proxy agent required for the download is not initialized or unavailable." });
        }
        const videoUrl = req.body.link;
        if (!videoUrl) {
            console.error('[MP3] No video URL provided');
            return res.status(400).json({ error: "No video URL provided", details: "Please provide a valid YouTube video URL in the request body." });
        }

        if(!ytdl.validateURL(videoUrl, {ytdlAgent})){
            console.error(`[MP3] Invalid YouTube URL: ${videoUrl}`);
            return res.status(400).json({ error: "Invalid YouTube URL", details: "The provided URL is not a valid YouTube video URL." });
        }
    
        const info = await ytdl.getInfo(videoUrl, {ytdlAgent})
        const title = info.videoDetails.title;
        console.log(`[MP3] Video successfully obtained: ${title}`)

        const formats = ytdl.filterFormats(info.formats || [], 'audioonly');
        console.log("[MP3] Checking audio formats")
        if (formats.length === 0) {
            console.error(`[MP3] No audio formats found for video: ${title}`);
            return res.status(400).json({ error: "No audio formats found", details: "The video does not contain any suitable audio formats for download." });
        }

        const mp4Format = formats.find(format => format.container === 'mp4');

        if (!mp4Format) {
            console.error(`[MP3] No MP4 audio format found for video: ${title}`);
            return res.status(400).json({ error: "No MP4 format available", details: "The video does not have an MP4 audio format available for download." });
        }
        console.log("[MP3] Audio formats found")

        console.log("[MP3] Creating WriteStream")
        const audioPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.m4a`);
        const audioWriteStream = fs.createWriteStream(audioPath);


        console.log("[MP3] Initiating process with ytdl")
        const ytdlStream = ytdl(videoUrl, { format: mp4Format, ytdlAgent})
        .on('progress', (chunkLength, downloaded, total) => {
            let percent = (downloaded / total * 100).toFixed(2);
        })
        .on('error', (error) => {
            console.error(`[MP3] Error in ytdl download for ${title}:`, error);
            res.status(500).json({ error: 'Error downloading audio', details: error.message });
        })
        ytdlStream.pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.m4a"`, // Change filename extension to .mp3 | m4a so MacOS likes it
            'Content-Type': 'audio/mp4',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[MP3] Video successfully converted: ${title}`);
            res.download(audioPath, `${encodeURIComponent(title)}.m4a`, (error) => {
                if (error) {
                    console.error(`[MP3] Error sending file to client for ${title}:`, error);
                    res.status(500).json({ error: "Error downloading file", details: error.message });
                } else {
                    fs.unlink(audioPath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`[MP3] Error deleting temporary file ${audioPath}:`, unlinkError);
                        } else {
                            console.log(`[MP3] File successfully deleted: ${audioPath}`);
                        }
                    });
                }
            });
        });

    } catch (error) {
        console.error('[MP3] Unhandled error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
    
})

module.exports = { progressEmitter, youtubeRouter: router };