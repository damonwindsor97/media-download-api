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
        "expirationDate": 1757728639.058224,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "D0wTPQY4VLUuYXiQ/ABLOKqMYgoBGrRmbx",
        "id": 1
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058313,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjNmo4w_CHf7UTTQS09a82iNbjqd1tI0GMWpnSKjGdLcbnUYZ7gO2GioaGn9zHYZ7mcQwACgYKAVgSARYSFQHGX2MiVKgRuqDlwNF6NXtDWvKwShoVAUF8yKp9bvVpDXVsdkym-KRxFZb40076",
        "id": 2
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754704730.200508,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzVtfKnsYd5K1VH4AdX2SWo0GdFO5tXgbFFlUmRfajQF6NRsDJLOvidGKotLimgzVa6V",
        "id": 3
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754704636.146982,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjIB4E2dkQ737_XguDd62_VTYXVPZzdJ51XQQjur_7V3U7LdMBNhISByyG1czb3PU5g4oRAA",
        "id": 4
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058242,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "D0wTPQY4VLUuYXiQ/ABLOKqMYgoBGrRmbx",
        "id": 5
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058326,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjNmo4w_CHf7UTTQS09a82iNbjqd1tI0GMWpnSKjGdLcbnUXPGsNnx7QeBbD7TqERDFvgACgYKAesSARYSFQHGX2MiNzU-Bt5a1uI7R_eW6XnZbxoVAUF8yKqEhK-6RmBDxwW7FWFYX7lt0076",
        "id": 6
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754704730.20053,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzXPyF9U90fYvOlchCExzNe3z4aS42axByNjqsi6zn6ygnhVYKXG1jh0febbmb72XRanLA",
        "id": 7
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754704636.147002,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjIB4E2dkQ737_XguDd62_VTYXVPZzdJ51XQQjur_7V3U7LdMBNhISByyG1czb3PU5g4oRAA",
        "id": 8
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058187,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "BP97fF8j4CTCog1m/Alahlxq4DagH6CFUW",
        "id": 9
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1723170381.359647,
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
        "expirationDate": 1757728639.058105,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "APERSOT38ZvJmMJeI",
        "id": 11
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728638.834563,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AFmmF2swRgIhAJfT6Q_4DyPMWCzeAOsWqZ_SEU_uEb_7ltOLGRoufma1AiEAooF-MuaZPmNe-fXqelRA7xlIAza3QoEn_OBTueYhwMc:QUQ3MjNmd1NidkpIOEZXdjU5MkUwdXNXQl9IdXlTTlF3a1hyX3pOblBTbEp3NExudERHUGtuMGthMVhnekdLTUZKV3dNZ0NpWjIyeTU2Qk1LbEdkeEhKbHRYZ3NDV1RQalVvd05vMnB6RWlwMkZ5cjdoeTNXQ0QtRTRraVZjVU13cExSaXdIOWctODczM0p5bmxqbjNNcXB6aVA5a214bTN3",
        "id": 12
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728644.600777,
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
        "expirationDate": 1757728639.058206,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "D0wTPQY4VLUuYXiQ/ABLOKqMYgoBGrRmbx",
        "id": 14
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058301,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjNmo4w_CHf7UTTQS09a82iNbjqd1tI0GMWpnSKjGdLcbnUDHS_VN-emP6VSqIiHaWzVAACgYKAcISARYSFQHGX2MiNqZmaW_HgzNX49OI7HSsnhoVAUF8yKo8S7Ba0vGUHPuI_DJBK91F0076",
        "id": 15
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754704730.200436,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzWscynUYK8xnuC4ApKy8bKgEmzUln70YtLdduq238n96f6ZX6k7z27z0uv4flLjyz3N",
        "id": 16
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757728639.058166,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AfM7p-0Z1x84UG8kB",
        "id": 17
    }
]

const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');


const agent = new HttpProxyAgent(proxyUrl, {
    rejectUnauthorized,
})

const ytdlOptions = {
    requestOptiona: {
        agent,
        headers: {
            'Cookie': cookieString
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