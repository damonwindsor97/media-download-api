const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path')

const scdl = require('soundcloud-downloader').default
const CLIENT_ID = 'wDSKS1Bp8WmdlRPkZ7NQXGs67PMXl2Nd'

router.route('/getTitle').post(async (req, res) => {
    try {
        const soundcloudUrl = req.body.link;

        const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);
        const title = info.title;

        res.send(title);
    } catch (error) {
        console.error(error);
        res.status(500).send("[SC] Error getting title");
    }
})

router.route('/getInfo').post(async (req, res) => {
    try {
        const soundcloudUrl = req.body.link;

        const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);

        res.send(info);
    } catch (error) {
        console.error(error);
        res.status(500).send("[SC] Error getting info");
    }
});

router.route('/downloadMp3').post(async (req, res) => {
    try {
        const soundcloudUrl = req.body.link;

        const info = await scdl.getInfo(soundcloudUrl, CLIENT_ID);
        const title = info.title;
        console.log('[SC] Audio Link successfully obtained')

        const audioPath = path.join(process.cwd(), "temp", `${encodeURIComponent(title)}.mp3`);

        const audioWriteStream = await scdl.download(soundcloudUrl, CLIENT_ID).then(stream => stream.pipe(fs.createWriteStream(audioPath)))

        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.m4a"`, // Change filename extension to .mp3 | m4a so MacOS likes it
            'Content-Type': 'audio/mp3',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[SC] Audio converting: ${title}`);
        
            res.download(audioPath, `${title}.mp3`, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send("Error downloading file");
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
});

module.exports = router;