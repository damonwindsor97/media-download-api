const fs = require('fs');
const path = require('path');

const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');


module.exports = {
    async testCallback(req, res, next){
        try {
            res.send("video endpoint hit")
        } catch (error) {
            res.send(error)
        }
    },


    async getInfo(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained:');
            }
            
            res.status(200).send(file)
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },


    async videoToMp3(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained');
            }
            
            const tempFilePath = file.path;
            console.log('Temp file path: ', tempFilePath);
    
  
            const outputFileName = `${file.originalname}.mp3`;
            const outputPath = path.join(process.cwd(), "temp", outputFileName);
    
            const ffmpegProcess = ffmpeg(tempFilePath)
                .noVideo()
                .audioCodec('libmp3lame')
                .format('mp3')
                .output(outputPath)
                .on('end', () => {
                    console.log(`Audio converting: ${outputFileName}`);
                    

                    res.set({
                        'Content-Disposition': `attachment; filename="${encodeURIComponent(outputFileName)}"`,
                        'Content-Type': 'audio/mp3',
                    });
                    

                    res.download(outputPath, outputFileName, (error) => {
                        if (error) {
                            console.log('Error downloading file: ', error);
                            res.status(500).send("Error downloading file: ", error);
                        } else {
                            console.log(`Audio converted and sent to user: ${outputFileName}`);
                            
                            // Clean up both temp files
                            try {
                                fs.unlinkSync(tempFilePath);
                                fs.unlinkSync(outputPath);
                                console.log('Temporary files successfully deleted');
                            } catch (cleanupError) {
                                console.error('Error during cleanup:', cleanupError);
                            }
                        }
                    });
                })
                .on('error', (error) => {
                    console.error('Error during conversion:', error);
                    res.status(500).send('Error converting file: ', error);
                });
                
            // Run the ffmpeg process
            ffmpegProcess.run();
    
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }


    
}