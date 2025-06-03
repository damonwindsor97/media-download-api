const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfmpegPath('C:/Program Files/ffmpeg/bin/ffmpeg.exe');


const fs = require('fs');
const { createReadStream } = require('fs');
const path = require('path');
require('dotenv').config()

const { Upload } = require('@aws-sdk/lib-storage');
const { s3Client } = require('../server/s3');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const now = new Date();
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');
const seconds = now.getSeconds().toString().padStart(2, '0')
const currentTime = `${hours}:${minutes} ${seconds}s`;




module.exports = {
    async testCallback(req, res, next){
        try {
            res.send("video endpoint hit")
        } catch (error) {
            res.send(error)
        }
    },

    async videoToMp3(req, res, next) {
        console.log('[MP4 > MP3] Request received at:', new Date().toISOString());
        const io = req.app.get('io');
        const file = req.file
        
        // create our key for S3, the time along with the files name
        const s3Key = `${currentTime}-${file.originalname}`;

        async function s3Cleanup(){
            try {
                await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: s3Key,
                }))
                console.log('[MP4 > MP3] S3 Cleanup complete')
            } catch (error) {
                console.log('[MP4 > MP3] Error during s3 cleanup')
            }
        }

        try {
            
            if (!req.file) {
                io.emit('error', { message: 'No file uploaded' })
                return res.status(400).send('No file uploaded');
            }

            console.log('[MP4 > MP3] File Obtained.');
            io.emit('progress', { percent: 0, message: 'File recieved' })
            
            const inputFilePath = file.path;
            const outputPath = path.join(
                path.dirname(inputFilePath),
                `${path.basename(inputFilePath)}.mp3`
            );
            
            io.emit('progress', { percent: 20, message: 'Contacting Server' })
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('[MP4 > MP3] Contacting Server for Upload.');

            try {
                // create a readable stream from the file that was uploaded by the user
                const fileStream = createReadStream(inputFilePath);
                // Start upload to amazon, multipart - so multiple parts are uploading at once
                io.emit('progress', { percent: 40, message: 'Uploading... Please be patient.' })
                const upload = new Upload({
                    client: s3Client,
                    params: {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: s3Key,
                        Body: fileStream,
                    },
                    queueSize: 8,
                    partSize: 50 * 1024 * 1024,
                    leavePartsOnError: false,
                });
                // basic progress tracking of file size upload
                upload.on('httpUploadProgress', (progress) => {
                    console.log(`[MP4 > MP3] Uploaded ${progress.loaded} of ${progress.total} bytes`);
                });

                const result = await upload.done();

                console.log(`[MP4 > MP3] Upload Success: ${result.Location}`);
                io.emit('progress', { percent: 70, message: 'Processing...' })

                // Download from S3 to a local file first, placing it in a temp location
                const s3DownloadPath = path.join(
                    path.dirname(inputFilePath),
                    `s3-downloaded-${path.basename(inputFilePath)}`
                );
                // check S3 Docs for function - uses our bucket name and key of the object
                const getObjectCommand = new GetObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: s3Key,
                });

                const s3Response = await s3Client.send(getObjectCommand);
                
                // Save the S3 stream to a local file
                const s3Stream = s3Response.Body;
                // create the writestream from the temp S3 file
                const s3WriteStream = fs.createWriteStream(s3DownloadPath);
                
                // THIS IS DIFFERENT TO WHAT I USUALLY DO!!
                // Use a promise to ensure the download completes, before running FFMPEG
                await new Promise((resolve, reject) => {
                    s3Stream.pipe(s3WriteStream)
                        .on('error', reject)
                        .on('finish', resolve);
                });
                
                console.log('[MP4 > MP3] S3 file downloaded, now processing with FFmpeg');
                io.emit('progress', { percent: 80, message: 'Converting...' })

                // Run the ffmpeg process within a promise to ensure it completes the function before spitting it back
                return new Promise((resolve, reject) => {
                    ffmpeg(s3DownloadPath)
                        .outputFormat('mp3')
                        .audioCodec('libmp3lame')
                        .audioBitrate(128) 
                        .audioChannels(2) 
                        .audioFrequency(44100) 
                        .output(outputPath)
                        // On error, run this
                        .on('error', (error) => {
                            console.error('FFmpeg processing failed:', error);
                            reject(error);
                        })
                        // On end, run this
                        .on('end', () => {
                            console.log('[MP4 > MP3] FFmpeg processing finished successfully');
                            resolve();
                        })
                        .run();
                })
                .then(() => {
                    // Clean up the og uploaded file and the S3 downloaded file
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(s3DownloadPath);
                    s3Cleanup()
                    
                    // Send the converted file
                    io.emit('progress', { percent: 100, message: 'Complete!' });

                    res.download(outputPath, 'converted.mp3', (error) => {
                        if (error) {
                            console.error('[MP4 > MP3] Download failed:', error);
                            return res.status(500).send('Failed to send file');
                        }

                        // Clean up
                        fs.unlink(outputPath, (unlinkError) => {
                            if (unlinkError) console.error('[MP4 > MP3] Failed to delete output file:', unlinkError);
                        });
                    });
                })
                .catch((error) => {
                    console.error('[MP4 > MP3] FFmpeg processing error:', error);
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(s3DownloadPath);
                    fs.unlinkSync(outputPath)
                    s3Cleanup()
                    return res.status(500).send('FFmpeg processing failed');
                });

            } catch (uploadError) {
                console.log('[MP4 > MP3] Error whilst uploading to Amazon Servers');
                return res.status(400).json({
                    message: 'Unable to upload to Amazon Servers',
                    error: uploadError.message,
                });
            }

        } catch (error) {
            console.error('[MP4 > MP3] Error converting video:', error);
            io.emit('error', {message: 'Upload failed' })
            return res.status(500).send('Internal Server Error');
        }
    },

    
}
