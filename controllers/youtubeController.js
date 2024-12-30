const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cp = require('child_process')

const ytdl = require('@distube/ytdl-core')
const ffmpeg = require('ffmpeg-static');
const { Agent } = require('https'); 

const { ytmp3, ytmp4 } = require('ruhend-scraper')
const fetch = require('node-fetch')


module.exports = {
    async testCallback(req, res, next){
        try {
            const videoUrl = req.body.link

            const data = await ytmp3(videoUrl)

            console.log(data)
            res.status(200).send( data);
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    },

    async getInfo(req, res, next){
        try {
            const videoUrl = req.body.link

            const response = await ytmp3(videoUrl);
            const data = response;

            console.log(data)
            res.status(200).send(data);
        } catch (error) {
            
        }
    },

    async getTitle(req, res, next){
        try {
            const videoUrl = req.body.link

            const data = await ytmp3(videoUrl)

            console.log(data.title)
            res.status(200).send( data.title);

        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    async downloadMp3(req, res, next) {
        try {
            const videoUrl = req.body.link;
            console.log('[YT>MP3] Link obtained')
    
            console.log('[YT>MP3] Awaiting response from scraper...')
            const response = await ytmp3(videoUrl);
            const audioUrl = response.audio;
            const audioTitle = response.title;
    
            console.log('[YT>MP3] Fetching response from audio URL...')
            const audioResponse = await fetch(audioUrl);
            if (!audioResponse.ok) {
                throw new Error('Failed to fetch audio file');
            }
    
            console.log('[YT>MP3] Setting Headers...')
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${audioTitle}.mp3"`);
            res.setHeader('X-Audio-Title', audioTitle);
            
            console.log('[YT>MP3] Awaiting audio response buffer...')
            const audioBuffer = await audioResponse.buffer();
    
            console.log('[YT>MP3] Sending audio to user...')
            res.status(200).send(audioBuffer);
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    },

    async downloadMp4(req, res, next){
        try {
            const youtubeUrl = req.body.link;
            console.log('[YT>MP4] Link obtained')

            console.log('[YT>MP3] Fetching response from scraper...')
            const response = await ytmp4(youtubeUrl);
            const videoUrl = response.video;
            
            console.log('[YT>MP4] Fetching response from video URL...')
            const videoResponse = await fetch(videoUrl);
            if(!videoResponse.ok){
                throw new Error('Failed to fetch video file')
            };

            console.log('[YT>MP4] Setting Headers...')
            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);

            console.log('[YT>MP4] Awaiting video response buffer')
            const videoBuffer = await videoResponse.buffer();

            console.log('[YT>MP4] Sending video to user...')

            res.status(200).send(videoBuffer)
        } catch (error) {
            console.log(error)
            res.status(400).send(error)
        }
    }


    // async downloadMp4(req, res, next){
    //     let ffmpegProcess;
    //     // array to store paths of temp files
    //     let cleanupFiles = [];
    
    //     // Cleanup function to kill the process and delete all temp files
    //     const cleanup = () => {
    //         // if the ffmpeg process exists, stop it immediantly
    //         if (ffmpegProcess) {
    //             ffmpegProcess.kill('SIGKILL');
    //         }
            
    //         // Then, go over all files with cleanupFiles array, deleting them
    //         cleanupFiles.forEach(file => {
    //             fs.unlink(file, (error) => {
    //                 if (error) console.error(`Error deleting file ${file}:`, error);
    //                 else console.log(`File deleted: ${file}`);
    //             });
    //         });
    //     };
    
    //     // Adding event listener to the req
    //     // 'close' event is emitted when user closes connection before response is sent back (from refreshing page etc.)
    //     req.on('close', cleanup);
    
    //     try {
    //         const videoUrl = req.body.link;
    //         console.log('[YT>MP4] YouTube link obtained');
    //         // Validate URL
    //         if (!ytdl.validateURL(videoUrl)) {
    //             return res.status(400).send('Invalid YouTube URL');
    //         }
    //         console.log('[YT>MP4] YouTube link Valid');
    
    //         const info = await ytdl.getInfo(videoUrl);
    //         const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
    //         console.log(`[YT>MP4] Video info obtained: ${title}`);
    
    //         const tempDir = path.join(process.cwd(), 'temp');
    //         const ffmpegPath = path.join(tempDir, `${title}_${Date.now()}.mp4`);
    //         cleanupFiles.push(ffmpegPath);
    
    //         console.log('[YT>MP4] Beginning ffmpeg process');
    //         ffmpegProcess = cp.spawn(ffmpeg, [
    //             '-loglevel', '8', '-hide_banner',
    //             '-progress', 'pipe:3',
    //             '-i', 'pipe:4',
    //             '-i', 'pipe:5',
    //             '-map', '0:a',
    //             '-map', '1:v',
    //             '-c:v', 'copy',
    //             ffmpegPath,
    //         ], {
    //             windowsHide: true,
    //             stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe'],
    //         });
    
    //         // ytdl jazziness
    //         console.log("[YT>MP4] Initiating process with ytdl");

    //         ytdl(videoUrl, { quality: 'highestvideo', agent: ytdlAgent}).pipe(ffmpegProcess.stdio[5])
    //         console.log("[YT>MP4] Video received, now getting audio...")

    //         ytdl(videoUrl, { quality: 'highestaudio', agent: ytdlAgent }).pipe(ffmpegProcess.stdio[4]);
    //         console.log("[YT>MP4] Video and Audio received")
            
    //         // Error Handling, for if user leaves unexpectedly
    //         // 'code' = exit code or exit status
    //         ffmpegProcess.on('close', (code) => {
    //             console.log(`[YT>MP4] ffmpeg process closed with code ${code}`);
    //             try {
    //                 console.log(`[YT>MP4] Video successfully converted: ${title}`);
    //                 res.download(ffmpegPath, `${title}.mp4`, (error) => {
    //                     if (error) {
    //                         console.error('[YT>MP4] Download error:', error);
    //                         res.status(500).send('Error downloading file');
    //                     }
    //                     cleanup();
    //                 });
    //             } catch (error) {
    //                 console.error(`[YT>MP4] ffmpeg process exited with code ${code}`);
    //                 res.status(500).send('Error processing video');
    //                 cleanup();
    //             }
    //         });
    //         // Standard Error handling
    //         ffmpegProcess.on('error', (error) => {
    //             console.error('[YT>MP4] ffmpegProcess error:', error);
    //             res.status(500).send('Internal server error during video processing');
    //             cleanup();
    //         });
    
    //     } catch (error) {
    //         console.error('[YT>MP4] Internal server error:', error);
    //         res.status(500).send('Internal server error.');
    //         cleanup();
    //     }
    // },
}