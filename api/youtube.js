const express = require('express')
const router = express.Router();

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// We are using a variant of ytdl-core that has quick fixes before the main repo implements them
// Once change is made to main repo, we can then install and replace ytdl-core where the @distube is instead 
const ytdl = require('@distube/ytdl-core')
const ffmpeg = require('ffmpeg-static');
const { create } = require('domain');

const proxyUrls = [
    "104.233.51.90:3199:damonwindsor-s98cv:xdg8tEeAna",
    "67.227.127.230:3199:damonwindsor-s98cv:xdg8tEeAna",
    "168.80.133.174:3199:damonwindsor-s98cv:xdg8tEeAna",
    "186.179.27.102:3199:damonwindsor-s98cv:xdg8tEeAna",
    "181.177.64.189:3199:damonwindsor-s98cv:xdg8tEeAna",
    "186.179.11.219:3199:damonwindsor-s98cv:xdg8tEeAna",
    "168.81.199.188:3199:damonwindsor-s98cv:xdg8tEeAna",
    "216.10.3.21:3199:damonwindsor-s98cv:xdg8tEeAna",
    "199.168.121.247:3199:damonwindsor-s98cv:xdg8tEeAna",
    "181.177.78.234:3199:damonwindsor-s98cv:xdg8tEeAna",
]

const agentOptions = {
    pipelining: 5,
    maxRedirections: 0,
};

const createAgent = (() => {
    let currentProxyIndex = 0;
    const getNextProxy = () => {
        const proxy = proxyUrls[currentProxyIndex];
        currentProxyIndex = (currentProxyIndex + 1) % proxyUrls.length;
        const [host, port, username, password] = proxy.split(':');
        return `http://${username}:${password}@${host}:${port}`;
    };

    return () => ytdl.createAgent(
        JSON.parse(fs.readFileSync("cookies.json")),
        agentOptions,
        getNextProxy()
    );
})();
let currentAgent = createAgent();

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {

    try {
        const videoUrl = req.body.link;
        if(!ytdl.validateURL)
            return res.status(500).send("Not a valid link!")

        const info = await ytdl.getInfo(videoUrl, { agent: currentAgent });
        const title = info.videoDetails.title;

        res.status(200).send(title)
        
    } catch (error) {
        console.log(error)
        currentAgent = createAgent()
        res.status(500).send("Internal Server Error getting Title")
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
        const info = await ytdl.getInfo(videoUrl, { agent: currentAgent });
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
        ytdl(videoUrl, { quality: 'highestaudio', agent: currentAgent }).pipe(ffmpegProcess.stdio[4]);
        ytdl(videoUrl, { quality: 'highestvideo', agent: currentAgent }).pipe(ffmpegProcess.stdio[5]);

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
        currentAgent = createAgent();
        res.status(500).send('Internal server error - contact an admin');
    }
});

router.route('/downloadMp3').post(async (req, res) => {    
    try {
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl, { agent: currentAgent }))
            return res.status(500).send("Invalid YouTube URL")
    
        const info = await ytdl.getInfo(videoUrl, { agent: currentAgent })
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

        ytdl(videoUrl, { format: mp4Format, agent: currentAgent }).pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${title}.m4a"`, // Change filename extension from .mp3 to m4a so MacOS likes it
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
        currentAgent = createAgent();
        res.status(500).send("Internal Server Error - contact an admin")
    }
})

module.exports = router