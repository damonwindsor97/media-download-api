const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg.exe');
// ffmpeg.setFfmpegPath('C:/Program Files/ffmpeg/bin/ffmpeg.exe');


const fs = require('fs');
const { createReadStream, unlinkSync } = require('fs');
const path = require('path');
require('dotenv').config()

const { Upload } = require('@aws-sdk/lib-storage');
const { s3Client } = require('../server/s3');
const { GetObjectCommand } = require('@aws-sdk/client-s3');

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
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            }

            console.log('File Obtained. - ', currentTime);
            console.log(file);

            const inputFilePath = file.path;
            const outputPath = path.join(
                path.dirname(inputFilePath),
                `${path.basename(inputFilePath)}.mp3`
            );

            console.log('Contacting Server for Upload. - ', currentTime);
            const s3Key = `${currentTime}-${file.originalname}`;

            try {
                // Upload to S3
                const fileStream = createReadStream(inputFilePath);
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

                upload.on('httpUploadProgress', (progress) => {
                    console.log(`Uploaded ${progress.loaded} of ${progress.total} bytes`);
                });

                const result = await upload.done();
                console.log(`Upload Success: ${result.Location} - ${currentTime}`);

                // Download from S3 to a local file first
                const s3DownloadPath = path.join(
                    path.dirname(inputFilePath),
                    `s3-downloaded-${path.basename(inputFilePath)}`
                );
                
                const getObjectCommand = new GetObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: s3Key,
                });

                const s3Response = await s3Client.send(getObjectCommand);
                
                // Save the S3 stream to a local file
                const s3Stream = s3Response.Body;
                const s3WriteStream = fs.createWriteStream(s3DownloadPath);
                
                await new Promise((resolve, reject) => {
                    s3Stream.pipe(s3WriteStream)
                        .on('error', reject)
                        .on('finish', resolve);
                });
                
                console.log('S3 file downloaded, now processing with FFmpeg');

                return new Promise((resolve, reject) => {
                    ffmpeg(s3DownloadPath)
                        .outputFormat('mp3')
                        .audioCodec('libmp3lame')
                        .audioBitrate(128) 
                        .audioChannels(2) 
                        .audioFrequency(44100) 
                        .output(outputPath)
                        .on('error', (err) => {
                            console.error('FFmpeg processing failed:', err);
                            reject(err);
                        })
                        .on('end', () => {
                            console.log('FFmpeg processing finished successfully');
                            resolve();
                        })
                        .run();
                })
                .then(() => {
                    // Clean up the original uploaded file and the S3 downloaded file
                    fs.unlinkSync(inputFilePath);
                    fs.unlinkSync(s3DownloadPath);
                    
                    // Send the converted file
                    res.download(outputPath, 'converted.mp3', (error) => {
                        if (error) {
                            console.error('Download failed:', error);
                            return res.status(500).send('Failed to send file');
                        }

                        // Clean up the output file after sending
                        fs.unlink(outputPath, (unlinkError) => {
                            if (unlinkError) console.error('Failed to delete output file:', unlinkError);
                        });
                    });
                })
                .catch((error) => {
                    console.error('FFmpeg processing error:', error);
                    return res.status(500).send('FFmpeg processing failed');
                });

            } catch (uploadError) {
                console.log('Error whilst uploading to Amazon Servers');
                return res.status(400).json({
                    message: 'Unable to upload to Amazon Servers',
                    error: uploadError.message,
                });
            }

        } catch (error) {
            console.error('Error converting video:', error);
            return res.status(500).send('Internal Server Error');
        }
    },

    
}
