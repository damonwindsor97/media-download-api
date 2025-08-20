 const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
 ffmpeg.setFfmpegPath('C:/Program Files/ffmpeg/bin/ffmpeg.exe');

const axios = require('axios')
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const AnonUser = require('../server/models/AnonUsers');


module.exports = {
    async testCallback(req, res, next){
        try {
            res.send("video endpoint hit")
        } catch (error) {
            res.send(error)
        }
    },

    async videoToMp3(req, res) {
    console.log('[MP4 > MP3] Request received at:', new Date().toISOString());

    const { url: downloadUrl, key, filename } = req.body;
    const token = req.cookies?.anon_token;
    const user = await AnonUser.findOne({ token })
    
    if(user && user.utilityHistory >= 50){
        return res.status(403).json({ error: 'Usage limit reached, please wait till your user expires'})
    }

    if(!user){
        return res.status(400).json({ error:'No guest user found, contact admin'})
    }

    if (!downloadUrl || !key) {
        return res.status(400).send('Missing download URL or key.');
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const inputPath = path.join(tempDir, `${uuidv4()}.mp4`);
    const outputPath = inputPath.replace('.mp4', '.mp3');

    try {
        const downloadStream = await axios.get(downloadUrl, {
        responseType: 'stream'
        });

        const writer = fs.createWriteStream(inputPath);
        downloadStream.data.pipe(writer);

        await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
        });

        console.log('[MP4 > MP3] File downloaded:', inputPath);

        await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputFormat('mp3')
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .audioChannels(2)
            .audioFrequency(44100)
            .save(outputPath)
            .on('end', resolve)
            .on('error', reject);
        });

        console.log('[MP4 > MP3] Conversion complete:', outputPath);
        const usageItem = {
            type: 'MP4 > MP3 Converter',
            timestamp: new Date(),
            details: {
                fileName: filename,
            }
        };

        await AnonUser.findOneAndUpdate(
        { token },
        { $push: { utilityHistory: usageItem } },
        { upsert: true }
        );
        console.log('[MP4 > MP3] Usage logged for anon user.');

        res.setHeader('Content-Type', 'audio/mpeg');
        // res.setHeader('Content-Disposition', 'attachment; filename="converted.mp3"');
        const stream = fs.createReadStream(outputPath);
        stream.pipe(res);


        stream.on('close', async () => {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            
        });

    } catch (error) {
        console.error('[MP4 > MP3] Conversion error:', error);
        try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (cleanupErr) {
            console.error('[MP4 > MP3] Cleanup failed:', cleanupErr);
        }
        return res.status(500).send('Conversion failed.');
        }
    },
}