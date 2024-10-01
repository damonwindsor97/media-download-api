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

const { HttpProxyAgent  } = require('http-proxy-agent');

const rejectUnauthorized = false;

const proxyUrl = process.env.PROXY_URL
console.log(`Using proxy: ${proxyUrl}`)

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.303,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000ogjBsxVmpbMAveN2H6_n-5-4Y5zvbN5xL0lQKE49SSXMboh9qOUL7v-ZlCoREpnCCklA0QACgYKARISARASFQHGX2MitdYTt5NzLJWZ5RzPAFD18BoVAUF8yKpOodHyrd6dCyExahyngVZW0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1727772231.495048,
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
        "expirationDate": 1759306448.302954,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQlrA-EsXv7FdqRVIfke0s_-Baqt-nvvE__iAmj9_vn4jDQXvFBrBPtp7GStXb8_0EAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.303046,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "6SQZn17mko0UB1Fu/A-WyJHxBnmqSKrPI_"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759306574.000441,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzVXBoj32FaBoX-EAzSuDHZ-PWf1C6tUyUibv7ovi1r4K5z4rEpkF0Ru84l3nfwFQqhOUg"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.303024,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFcPqFJxCHNMckMcW"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.303057,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "6SQZn17mko0UB1Fu/A-WyJHxBnmqSKrPI_"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.302987,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": null,
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "g.a000ogjBsxVmpbMAveN2H6_n-5-4Y5zvbN5xL0lQKE49SSXMboh9hpKAQiiDk4FgxTeb_jAMqwACgYKAewSARASFQHGX2MiodWszEMopqUSM0pwTkUfixoVAUF8yKrIdTH4q8b73yGXOp28lRuK0076"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.303069,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "6SQZn17mko0UB1Fu/A-WyJHxBnmqSKrPI_"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759306574.00046,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AKEyXzXxXFYdonmJJTXTVujpXvVsm-kRXLg-_4gyseUqBvdpKhRQCszHDmhl1czSHiOjMAem"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1759306448.302971,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "sidts-CjEBQlrA-EsXv7FdqRVIfke0s_-Baqt-nvvE__iAmj9_vn4jDQXvFBrBPtp7GStXb8_0EAA"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330448.957203,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": null,
        "value": "AFmmF2swRgIhAMGDoaluFZTsKWSyawmIPGhjes2lVmdfPGgaN2ywe2ypAiEAi4BZ0tNfhHbQeYjtofx610nmFq1x0W0-KwLvfK5DSh0:QUQ3MjNmeElDeEdVbEFtUWo4LWZoU3VpX2hIZnpYZDl5NHlOVWRmR2FvWC1WV3k2U2xWTEFIcXNxVDViUUdDNmNfMkJwOGItTFAwU1dXOW9pTEh4SG1HUFpxQkphU3dWTVg3UlVLTE50S0hGQTBjbktmRlRWYzdYV3RTR0lHQkdyZ1NYN1plVUh0OTJ2WFFOYUQwYUZJclI0T29RcWdJUmhn"
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1762330456.942327,
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

const agent = new HttpProxyAgent(proxyUrl, {
    rejectUnauthorized,
}, cookies)

const ytdlOptions = {
    requestOptiona: {
        agent,
        headers: {
            'Cookie': cookies
        }
    }
}

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {
    try {

        const videoUrl = req.body.link;
        if(!ytdl.validateURL(videoUrl, ytdlOptions)){
            console.error(`[Title] Invalid YouTube URL: ${videoUrl}`);
            return res.status(400).json({ error: "Invalid YouTube URL", details: "The provided URL is not a valid YouTube video URL." });
        }

        const info = await ytdl.getInfo(videoUrl, ytdlOptions)
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
        const videoUrl = req.body.link;

        // Validate video URL
        if (!videoUrl) {
            console.error('[MP3] No video URL provided');
            return res.status(400).json({ error: "No video URL provided" });
        }

        if (!ytdl.validateURL(videoUrl)) {
            console.error(`[MP3] Invalid YouTube URL: ${videoUrl}`);
            return res.status(400).json({ error: "Invalid YouTube URL" });
        }

        // Get video info
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;
        console.log(`[MP3] Video obtained: ${title}`);

        // Filter audio formats
        const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
        if (audioFormats.length === 0) {
            console.error(`[MP3] No audio formats found for video: ${title}`);
            return res.status(400).json({ error: "No audio formats found" });
        }

        const mp4Format = audioFormats.find(format => format.container === 'mp4');
        if (!mp4Format) {
            console.error(`[MP3] No MP4 audio format found for video: ${title}`);
            return res.status(400).json({ error: "No MP4 format available" });
        }

        // Create write stream
        const audioPath = path.join(process.cwd(), "temp", `${encodeURIComponent(title)}.m4a`);
        const audioWriteStream = fs.createWriteStream(audioPath);

        // Initiate download
        console.log("[MP3] Starting download...");
        const ytdlStream = ytdl(videoUrl, { format: mp4Format })
            .on('progress', (chunkLength, downloaded, total) => {
                console.log(`[MP3] Downloaded ${downloaded} of ${total}`);
            })
            .on('error', (error) => {
                console.error(`[MP3] Download error for ${title}:`, error);
                return res.status(500).json({ error: 'Error downloading audio', details: error.message });
            });

        ytdlStream.pipe(audioWriteStream);

        // Set response headers for download
        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.m4a"`,
            'Content-Type': 'audio/mp4',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[MP3] Download finished: ${title}`);
            res.download(audioPath, `${encodeURIComponent(title)}.m4a`, (error) => {
                if (error) {
                    console.error(`[MP3] Error sending file to client for ${title}:`, error);
                } else {
                    fs.unlink(audioPath, (unlinkError) => {
                        if (unlinkError) {
                            console.error(`[MP3] Error deleting temporary file:`, unlinkError);
                        } else {
                            console.log(`[MP3] Temporary file deleted: ${audioPath}`);
                        }
                    });
                }
            });
        });

    } catch (error) {
        console.error('[MP3] Unhandled error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = { progressEmitter, youtubeRouter: router };