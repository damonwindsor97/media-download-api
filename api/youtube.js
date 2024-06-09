const express = require('express')
const router = express.Router();

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const ytdl = require('ytdl-core')
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

        // Validation, just checking to see if the URL is valid
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(500).send('Invalid YouTube URL');
        }
        
        const info = await ytdl.getInfo(videoUrl); // query video to get info
        const title = info.videoDetails.title; // save title of the video
        
        const tempDir = path.join(process.cwd(), "temp"); // Custom temporary directory
        const ffmpegPath = path.join(tempDir, `${title}${Date.now()}.mp4`); // Path for the temporary output file, video name + current date

        // Start the ffmpeg child process
        const ffmpegProcess = cp.spawn(ffmpeg, [
            '-loglevel', '8', '-hide_banner',
            '-progress', 'pipe:3',
            '-i', 'pipe:4',
            '-i', 'pipe:5',
            '-map', '0:a',
            '-map', '1:v',
            '-c:v', 'copy',
            // Provide ffmpegPath as the output file name
            ffmpegPath, 
        ], {
            windowsHide: true,
            stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
        });

        // Pipe streams from ytdl directly into ffmpegProcess - grabbing audio + video from YouTube and putting into FFmpeg process
        ytdl(videoUrl, { quality: 'highestaudio' }).pipe(ffmpegProcess.stdio[4]);
        ytdl(videoUrl, { quality: 'highestvideo' }).pipe(ffmpegProcess.stdio[5]);

        // Callback to check if ffmpegProcess is finished, otherwise display an error
        ffmpegProcess.on('close', () => {
            console.log('ffmpegProcess finished');

            // After ffmpegProcess is finished, send the file to the client
            res.download(ffmpegPath, `${title}${Date.now()}.mp4`, () => {
                // Delete the temp video file once it is downloaded
                fs.unlink(ffmpegPath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File Deleted:', ffmpegPath);
                    }
                });
            });
        });

        // Error handling for ffmpeg process
        ffmpegProcess.on('error', (err) => {
            console.error('ffmpegProcess error:', err);
            res.status(500).send('Internal server error during video processing');
        });

        // Link streams - Listens for data events from the ffmpeg process's stdout stream
        ffmpegProcess.stdio[3].on('data', chunk => {
            // Parse the param=value list returned by ffmpeg
            const lines = chunk.toString().trim().split('\n');
            const args = {};
            for (const l of lines) {
                const [key, value] = l.split('=');
                args[key.trim()] = value.trim();
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error - please contact an admin');
    }
});

router.route('/downloadMp3').post(async (req, res) => {    
    try {
        const videoUrl = req.body.link;

        if(!ytdl.validateURL(videoUrl))
            return res.status(500).send("Invalid URL")
    
        const options = {
            quality: "highestaudio",
            filter: "audio"
        };

        const info = await ytdl.getInfo(videoUrl)
        console.log(info)

        const title = info.videoDetails.title;

        const videoPath = path.join(process.cwd(), "temp", `${encodeURI(title)}.mp4`) 
        console.log(videoPath)

        const videoWriteStream = fs.createWriteStream(videoPath);
        ytdl(videoUrl, options).pipe(videoWriteStream);

        videoWriteStream.on('finish', () => {
            res.download(videoPath, `${title}.mp3`, () => {
                fs.unlinkSync(videoPath)
            })
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error - please contact an admin")
    }
})

module.exports = router