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

const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
};

const agent = ytdl.createAgent(cookies, agentOptions)

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