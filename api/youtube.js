const express = require('express')
const router = express.Router();

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// We are using a variant of ytdl-core that has quick fixes before the main repo implements them
// Once change is made to main repo, we can then install and replace ytdl-core where the @distube is instead 
const ytdl = require('@distube/ytdl-core')

const ffmpeg = require('ffmpeg-static');

const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189788,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "r1nEsfaAKT3dcyKF/AU5BG922qbXXnpmoG",
        "id": 1
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.1897,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "g.a000mQj1WhZo1Fw1BD01zBRQtf8vX0pR8gTT6ArgpGbpnf9RkVWvncbSL6Ry1_TGkiZuLEjk7gACgYKAUgSARISFQHGX2MiWS8gt5NgDJpIzKe7-0MF0BoVAUF8yKouJtmLMA9WbrGklGvzUjWm0076",
        "id": 2
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754660708.371083,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzWxE97cK7dFlDZN7WarNCbsyJIYPoU-svRCnlzuyZTx27mTHX8vuc244V7ifPWuQ-nCWxI",
        "id": 3
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754660488.433307,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "sidts-CjEB4E2dkfls5HbCoifHUcyj2wb9FpY0bM8B0TuOg56hyD0D6xWvUN67JQn0pSOrE5gzEAA",
        "id": 4
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189803,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "r1nEsfaAKT3dcyKF/AU5BG922qbXXnpmoG",
        "id": 5
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189716,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "g.a000mQj1WhZo1Fw1BD01zBRQtf8vX0pR8gTT6ArgpGbpnf9RkVWvZH6t-qenIwXuWN1CM8CccwACgYKAa8SARISFQHGX2MiIFwlOtgKSM2idhqFAzGXWxoVAUF8yKowb11jJK83zuyepfCHUBQq0076",
        "id": 6
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754660708.371109,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzWB_XSoAZdP_gg68heNmNg4uurJRmejUQhr-WeR7sS12Xx5f_niq-yyU6ro04plXHggnT4",
        "id": 7
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754660488.433378,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "sidts-CjEB4E2dkfls5HbCoifHUcyj2wb9FpY0bM8B0TuOg56hyD0D6xWvUN67JQn0pSOrE5gzEAA",
        "id": 8
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189759,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "Yd-WdtKdd8XeCJO9/ANy4pDJkrHNgn2bqI",
        "id": 9
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189732,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "AeHmb53Tnvwp4mIDf",
        "id": 10
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757684644.247621,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AFmmF2swRAIgK4kzFLBfKJlNV295EOU9813Hf7sma9zO0kp8ktXa8bECIHi1RnwMgtwSxpRAZmfLPK-5J8yHPGYG7BZA1WrMmY7_:QUQ3MjNmd0J4OWdLM0hqaEFZaWtlM3dfZDd0Uzh2cjRZVFItb0pGcjU0VmFfamRXRkNtamJydWs1aElrcW9EYVZOYXN0Z2tYY3oyT09TNGt6NjFWbmloTjdvSWRWYVlMbVNQYzduLXJ2MlpvTE1YU0E5SHFaQm9La3RUdWxQM0l3U2V2RmU0REJHZkF3TWhCaFliMHlVUU0tc09zcHJYd25helY2akFNRndSTkNlMlpBQXBEanNMY00tVHhnUVE1QWpmeXk2THZyaFYxNDlmcXZhN3JHeHBod2ZzV3VyTUJQUQ==",
        "id": 11
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757684653.183959,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "volume=15&f6=80&f7=4100&tz=Australia.Sydney&f5=30000",
        "id": 12
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189773,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "r1nEsfaAKT3dcyKF/AU5BG922qbXXnpmoG",
        "id": 13
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189597,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "g.a000mQj1WhZo1Fw1BD01zBRQtf8vX0pR8gTT6ArgpGbpnf9RkVWvGduAFdMAH4-bHZ67Sl9wpwACgYKATUSARISFQHGX2Mis_RuJ9ouxhwniyotE0rsDBoVAUF8yKqp7oi4DBPtovAG8QjXxreQ0076",
        "id": 14
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754660708.371003,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "AKEyXzUil-uxbaZxB1ZlJWjgWhv9HTQd2Rd8j9CuO53DfYKiMxWzdgruWaLDpiAOYgSRbxhaWpPw",
        "id": 15
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1756950891.189746,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "ASZJAPW6UAgVkLTJt",
        "id": 16
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1723124713,
        "hostOnly": false,
        "httpOnly": false,
        "name": "ST-3opvp5",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "session_logininfo=AFmmF2swRAIgK4kzFLBfKJlNV295EOU9813Hf7sma9zO0kp8ktXa8bECIHi1RnwMgtwSxpRAZmfLPK-5J8yHPGYG7BZA1WrMmY7_%3AQUQ3MjNmd0J4OWdLM0hqaEFZaWtlM3dfZDd0Uzh2cjRZVFItb0pGcjU0VmFfamRXRkNtamJydWs1aElrcW9EYVZOYXN0Z2tYY3oyT09TNGt6NjFWbmloTjdvSWRWYVlMbVNQYzduLXJ2MlpvTE1YU0E5SHFaQm9La3RUdWxQM0l3U2V2RmU0REJHZkF3TWhCaFliMHlVUU0tc09zcHJYd25helY2akFNRndSTkNlMlpBQXBEanNMY00tVHhnUVE1QWpmeXk2THZyaFYxNDlmcXZhN3JHeHBod2ZzV3VyTUJQUQ%3D%3D",
        "id": 17
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1728815756.435499,
        "hostOnly": false,
        "httpOnly": true,
        "name": "VISITOR_PRIVACY_METADATA",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "CgJBVRIEGgAgTA%3D%3D",
        "id": 18
    }
]
const agent = ytdl.createAgent(cookies)

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {

    try {
        const videoUrl = req.body.link;
        if(!ytdl.validateURL)
            return res.status(500).send("Not a valid link!")

        const info = await ytdl.getInfo(videoUrl, { agent });
        const title = info.videoDetails.title;

        res.status(200).send(title)
        
    } catch (error) {
        console.log(error)
    }
})

router.route('/downloadMp4').post(async (req, res) => {
    try {
        const videoUrl = req.body.link;

        // Validate YouTube URL
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(500).send('Invalid YouTube URL');
        }

        // Get video info
        const info = await ytdl.getInfo(videoUrl, { agent });
        const title = info.videoDetails.title;

        console.log(`[MP4] Video successfully obtained: ${title}`);

        // Prepare paths
        const tempDir = path.join(process.cwd(), 'temp');
        const ffmpegPath = path.join(tempDir, `${title}${Date.now()}.mp4`);

        // Start ffmpeg process
        const ffmpegProcess = cp.spawn(ffmpeg, [
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

        // Pipe video/audio streams into ffmpeg process
        ytdl(videoUrl, { quality: 'highestaudio' }, { agent }).pipe(ffmpegProcess.stdio[4]);
        ytdl(videoUrl, { quality: 'highestvideo' }, { agent }).pipe(ffmpegProcess.stdio[5]);

        // Listen for ffmpeg process close event
        ffmpegProcess.on('close', () => {
            console.log(`[MP4] Video successfully converted: ${title}`);
        
            // After ffmpegProcess is finished, send the file to the client
            res.download(ffmpegPath, `${title}.mp4`, (error) => {
                if (error) {
                    console.error('[MP4] Download error:', error);
                    res.status(500).send('Error downloading file', error);
                } else {
                    // Delete the temp video file after successful download
                    fs.unlink(ffmpegPath, (error) => {
                        if (error) {
                            console.error('[MP4] Error deleting file:', error);
                        } else {
                            console.log('[MP4] File deleted:', ffmpegPath);
                        }
                    });
                }
            });
        });

        // Handle ffmpeg process errors
        ffmpegProcess.on('error', (error) => {
            console.error('[MP4] ffmpegProcess error:', error);
            res.status(500).send('Internal server error during video processing');
        });

        // Listen for data events from ffmpeg process stdout stream
        ffmpegProcess.stdio[3].on('data', chunk => {
            // Parse ffmpeg output if needed
            const lines = chunk.toString().trim().split('\n');
            const args = {};
            for (const line of lines) {
                const [key, value] = line.split('=');
                args[key.trim()] = value.trim();
            }
        });

    } catch (error) {
        console.error('[MP4] Server-side error:', error);
        res.status(500).send('Internal server error - contact an admin');
    }
});

router.route('/downloadMp3').post(async (req, res) => {    
    try {
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl))
            return res.status(500).send("Invalid YouTube URL")
    
        const info = await ytdl.getInfo(videoUrl, { agent })
        const title = info.videoDetails.title;
        console.log(`[MP3] Video successfully obtained: ${title}`)

        const formats = ytdl.filterFormats(info.formats || [], 'audioonly');
        
        if (formats.length === 0) {
            return res.status(400).send("No audio formats found for the provided video");
        }

        const mp4Format = formats.find(format => format.container === 'mp4');

        if (!mp4Format) {
            return res.status(400).send("No MP4 format for the provided video");
        }

        const audioPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.mp4`);
        const audioWriteStream = fs.createWriteStream(audioPath);

        ytdl(videoUrl, { format: mp4Format }, { agent }).pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${title}.m4a"`, // Change filename extension to .mp3 | m4a so MacOS likes it
            'Content-Type': 'audio/mp4',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[MP3] Video successfully converted: ${title}`);
            res.download(audioPath, `${title}.mp3`, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(audioPath);
                    console.log(`[MP3] File successfully deleted: ${audioPath}`)
                }
            });
        });

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error - contact an admin")
    }
})

module.exports = router