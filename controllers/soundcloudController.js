const fs = require('fs');
const path = require('path')
require('dotenv').config();
const AnonUser = require('../server/models/AnonUsers');

const scdl = require('soundcloud-downloader').default
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID

module.exports = {

    async testCallback(req, res, next){
        try {
            console.log('test working')
            res.send('test working')
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },

    async getTitle(req, res, next){
        try {
            const soundcloudUrl = req.body.link;
    
            const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);
            const title = info.title;
    
            res.send(title);
        } catch (error) {
            console.error(error);
            res.status(500).send("[SC] Error getting title");
        }
    },

    async getInfo(req, res, next){
        try {
            const soundcloudUrl = req.body.link;
    
            const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);
    
            res.send(info);
        } catch (error) {
            console.error(error);
            res.status(500).send("[SC] Error getting info");
        }
    },

    async downloadMp3(req, res, next){
        try {
            const token = req.cookies?.anon_token;
            console.log('[SC > MP3] Anon token from cookie:', token);

            const user = await AnonUser.findOne({ token });
            if(user && user.utilityHistory >= 50){
                return res.status(403).json({ error: "Usage limit reached, please wait till your user expires"})
            }

            if(!user){
                return res.status(400).json({ error: "No guest user found, contact admin"})
            }

            const soundcloudUrl = req.body.link;

            const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);

            const title = info.title;
            const duration = info.duration
            console.log('[SC] Audio Link successfully obtained')

            const audioPath = path.join(process.cwd(), "temp", `${encodeURIComponent(title)}.mp3`);

            let downloadStream;
            try {
                downloadStream = await scdl.downloadFormat(soundcloudUrl, scdl.FORMATS.MP3, CLIENT_ID);
            } catch (error) {
                downloadStream = await scdl.download(soundcloudUrl, CLIENT_ID);
            }

            const audioWriteStream = downloadStream.pipe(fs.createWriteStream(audioPath))

            res.set({
                'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.mp3"`,
                'Content-Type': 'audio/mp3',
            });

            console.log('[SC > MP3] Creating item for usage history')
            const usageItem = {
                type: 'Soundcloud Converter',
                timestamp: new Date(),
                details: {
                    title: title,
                    source: soundcloudUrl,
                    duration: duration
                }
            };
            console.log('[SC > MP3] Updating Anon user with usage history')
            await AnonUser.findOneAndUpdate(
                { token },
                { $push: { utilityHistory: usageItem } },
                { new: true, upsert: true}
            )

            audioWriteStream.on('finish', () => {
                console.log(`[SC] Audio converting: ${title}`);
            
                res.download(audioPath, `${title}.mp3`, (error) => {
                    if (error) {
                        console.log('[SC] Error downloading file: ', error);
                        res.status(500).send("Error downloading file: ", error);
                    } else {
                        console.log(`[SC] Audio converted: ${title}`);
                        fs.unlinkSync(audioPath);
                        console.log(`[SC] File successfully deleted: ${audioPath}`)
                    }
                });
            });
            
        } catch (error) {
            console.log(error);
            res.status(500).send("Error downloading file");
        }
    },

    async downloadPlaylist(req, res, next){
        try {
            const soundcloudUrl = req.body.link
            
        } catch (error) {
            
        }
    }

}