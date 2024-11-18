const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process')

module.exports = {
    async testCallback(req, res, next){
        try {
            res.send('YouTube endpoint hit');
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    },

    async getTitle(req, res, next){
        try {
            const { videoId } = req.body; 
            console.log(`Obtained video ID: ${videoId}`);
          
            if (!videoId) {
                return res.status(400).json({ error: 'YouTube video ID is required' });
            }
            
            // options / settings for the API
            const options = {
                method: 'GET',
                url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
                params: { id: videoId },
                headers: {
                    'x-rapidapi-key': process.env.YOUTUBE_MP4_API_KEY,
                    'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                }
            };
    
            console.log('Making Request')
            const response = await axios.request(options);
            const title = (response.data.title);

            res.send(title)
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },

    async youtubeToMp4(req, res, next) {
        let ffmpegProcess;
        let cleanupFiles = [];
    
        const cleanup = () => {
            if (ffmpegProcess) {
                ffmpegProcess.kill('SIGKILL');
            }

            cleanupFiles.forEach(file => {
                fs.unlink(file, (error) => {
                    if (error) console.error(`Error deleting file ${file}:`, error);
                    else console.log(`File deleted: ${file}`);
                });
            });
        };
    
        req.on('close', cleanup);
    
        try {
            const { videoId } = req.body; 
            console.log(`Obtained video ID: ${videoId}`);
          
            if (!videoId) {
                return res.status(400).json({ error: 'YouTube video ID is required' });
            }
            
            // options / settings for the API
            const options = {
                method: 'GET',
                url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
                params: { id: videoId },
                headers: {
                    'x-rapidapi-key': process.env.YOUTUBE_MP4_API_KEY,
                    'x-rapidapi-host': 'ytstream-download-youtube-videos.p.rapidapi.com'
                }
            };
    
            console.log('Making Request')
            const response = await axios.request(options);
            const title = encodeURIComponent(response.data.title);
    
            // Get highest quality audio and video streams
            // Specifically, we get any audio but a specific video codec and quality (pain in the botyhole)
            console.log('Getting Audio and Video streams')
            const audioFormat = response.data.adaptiveFormats.find(format => format.mimeType.includes('audio/mp4'));
            const videoFormat = response.data.adaptiveFormats.find(format => format.mimeType.includes('video/mp4; codecs="avc1.640028"') + response.data.adaptiveFormats.find(quality => quality.qualityLabel.includes('1080p')));

    
            if (!audioFormat || !videoFormat) {
                throw new Error('Could not find compatible audio and video streams');
            }
    
            const tempDir = path.join(process.cwd(), './temp');
            // Ensure temp directory exists
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
    
            const outputPath = path.join(tempDir, `${title}${Date.now()}.mp4`);
            cleanupFiles.push(outputPath);
    
            console.log('[YT>MP4] Beginning ffmpeg process')
            // Use ffmpeg to combine audio and video streams
            ffmpegProcess = cp.spawn(ffmpeg, [
                '-i', videoFormat.url,
                '-i', audioFormat.url,
                '-c:v', 'copy',
                '-c:a', 'aac',
                outputPath
            ]);
    
            ffmpegProcess.stderr.on('data', (data) => {
                console.log(`ffmpeg stderr: ${data}`);
            });
    
            ffmpegProcess.on('close', (code) => {
                console.log(`[YT>MP4] ffmpeg process closed with code ${code}`);
                if (code === 0) {
                    console.log(`[YT>MP4] Video successfully converted: ${title}`);
                    res.download(outputPath, `${title}.mp4`, (error) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send("Error downloading file", error);
                        } else {
                            console.log(`[YT>MP4] Audio converted: ${title}`);
                            fs.unlinkSync(outputPath);
                            console.log(`[YT>MP4] File successfully deleted: ${outputPath}`)
                        }

                    });
                } else {
                    console.error(`[YT>MP4] ffmpeg process exited with code ${code}`);
                    res.status(500).send('Error processing video');
                    cleanup();
                }
            });
    
            ffmpegProcess.on('error', (error) => {
                console.error('[YT>MP4] ffmpegProcess error:', error);
                res.status(500).send('Internal server error during video processing');
                cleanup();
            });
    
        } catch (error) {
            console.error('Error in youtubeToMp4:', error);
            cleanup();
            res.status(500).json({ error: 'An error occurred while processing the video' });
        }
    },
};