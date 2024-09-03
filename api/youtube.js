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
    
const agent = ytdl.createAgent(cookies)

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {
    try {
        if (!agent) {
            return res.status(500).send("Proxy agent not available");
        }

        const videoUrl = req.body.link;
        if(!ytdl.validateURL)
            return res.status(500).send("Not a valid link!")

        const info = await ytdl.getInfo(videoUrl, { agent } );
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
        ytdl(videoUrl, { quality: 'highestaudio', agent }).pipe(ffmpegProcess.stdio[4]);
        ytdl(videoUrl, { quality: 'highestvideo', agent }).pipe(ffmpegProcess.stdio[5]);

        

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
        if (!agent) {
            return res.status(500).send("Proxy agent not available");
        }
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl, { agent }))
            return res.status(500).send("Invalid YouTube URL")
    
        const info = await ytdl.getInfo(videoUrl, { agent })
        const title = info.videoDetails.title;
        console.log(`[MP3] Video successfully obtained: ${title}`)

        const formats = ytdl.filterFormats(info.formats || [], 'audioonly');
        console.log("[MP3] Checking audio formats")
        if (formats.length === 0) {
            return res.status(400).send("No audio formats found for the provided video");
        }

        const mp4Format = formats.find(format => format.container === 'mp4');

        if (!mp4Format) {
            return res.status(400).send("No MP4 format for the provided video");
        }
        console.log("[MP3] Audio formats found")

        console.log("[MP3] Creating WriteStream")
        const audioPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.m4a`);
        const audioWriteStream = fs.createWriteStream(audioPath);

        console.log("[MP3] Initiating process with ytdl")
        ytdl(videoUrl, { format: mp4Format, agent}).pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.m4a"`, // Change filename extension to .mp3 | m4a so MacOS likes it
            'Content-Type': 'audio/mp4',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[MP3] Video successfully converted: ${title}`);
            res.download(audioPath, `${encodeURIComponent(title)}.m4a`, (error) => {
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