const express = require('express')
const router = express.Router();

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

// We are using a variant of ytdl-core that has quick fixes before the main repo implements them
// Once change is made to main repo, we can then install and replace ytdl-core where the @distube is instead 
const ytdl = require('@distube/ytdl-core')

const ffmpeg = require('ffmpeg-static');

// Route base/youtubeMp4
router.route('/getTitle').post(async (req, res) => {

    try {
        const videoUrl = req.body.link;
        if(!ytdl.validateURL)
            return res.status(500).send("Not a valid link!")

        const info = await ytdl.getInfo(videoUrl);
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
        const info = await ytdl.getInfo(videoUrl);
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
        ytdl(videoUrl, { quality: 'highestaudio' }).pipe(ffmpegProcess.stdio[4]);
        ytdl(videoUrl, { quality: 'highestvideo' }).pipe(ffmpegProcess.stdio[5]);

        // Listen for ffmpeg process close event
        ffmpegProcess.on('close', () => {
            console.log(`[MP4] Video successfully converted: ${title}`);
        
            // After ffmpegProcess is finished, send the file to the client
            res.download(ffmpegPath, `${title}.mp4`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                    res.status(500).send('Error downloading file');
                } else {
                    // Delete the temp video file after successful download
                    fs.unlink(ffmpegPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error('Error deleting file:', unlinkErr);
                        } else {
                            console.log('File deleted:', ffmpegPath);
                        }
                    });
                }
            });
        });

        // Handle ffmpeg process errors
        ffmpegProcess.on('error', (error) => {
            console.error('ffmpegProcess error:', error);
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
        console.error('Server-side error:', error);
        res.status(500).send('Internal server error - please contact an admin');
    }
});



router.route('/downloadMp3').post(async (req, res) => {    
    try {
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl))
            return res.status(500).send("Invalid YouTube URL")
    
        const info = await ytdl.getInfo(videoUrl)
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

        ytdl(videoUrl, { format: mp4Format }).pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${title}.m4a"`, // Change filename extension to .mp3
            'Content-Type': 'audio/mp4', // Set content type to audio/mpeg for MP3 format
        });

        audioWriteStream.on('finish', () => {
            console.log(`[MP3] Video successfully converted: ${title}`);
            res.download(audioPath, `${title}.mp3`, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(audioPath);
                    console.log(`File successfully deleted: ${audioPath}`)
                }
            });
        });

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error - please contact an admin")
    }
})

module.exports = router