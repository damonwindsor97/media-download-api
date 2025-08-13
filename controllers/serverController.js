require('dotenv').config()
const crypto = require('crypto');
const path = require('path');

const AnonUser = require('../server/models/AnonUsers');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } = require('@aws-sdk/client-s3');

const uid = function(){
    return `${new Date().getTime()}-${crypto.randomBytes(4).toString('hex')}`;
};

module.exports = {


    //  function to generate an anonymous token for the user

    async getAnonToken(req, res, next){
        let token = req.cookies?.anon_token;

        try {
            if (!token) {
                console.log('No Anon token found, generating...')
                token = crypto.randomUUID();
                
                console.log('Saving token to database')
                await AnonUser.create({ token });

                console.log('Setting cookie with token');
                res.cookie('anon_token', token, {
                    httpOnly: true, 
                    sameSite: 'lax',
                    maxAge: 1000 * 60 * 60 * 24 * 7, 
                });

                console.log('Successfully generated Anon token: ', token);
                req.anon_token = token;
                
                return res.status(200).send({ message: 'Anon token created', token });

            } else {
                const existingUser = await AnonUser.findOne({ token });

                if (!existingUser) {
                    console.log('Anon token not found in database, creating new one');
                    await AnonUser.create({ token });
                } else {
                    console.log('Anon token already exists in database');
                }
                req.anon_token = token;
                console.log('Using existing Anon token: ', token);
            }

            res.status(200).send({ message: 'Anon token exists', token });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Internal server error' })
        }
    },

    async deleteAnonToken(req, res, next){
        const token = req.cookies?.anon_token;

        if(!token){
            return res.status(400).json({ error: 'No anonymous token found'})
        };

        try {
            console.log('[AnonUser] Attempting to delete user from database')
            const userResposne = await AnonUser.findOne({ token });
            console.log(userResposne)

            console.log('[AnonUser] User successfully deleted from database')
            res.status(200).json({ message: 'User deleted from database'})
        } catch (error) {
            res.status(400).json({ error: 'Error when deleting user from database'})
        }
    },

    // function to get the anonymous user's utility history
    async getAnonHistory(req, res, next) {
        const token = req.cookies?.anon_token;
        if (!token) {
            return res.status(400).json({ error: 'No anonymous token found' });
        };

        try {
            const userResponse = await AnonUser.findOne({ token }).exec();
            if (!userResponse) {
                return res.status(400).json({ error: 'Anonymous user not found' });
            } 
            if (!userResponse.utilityHistory || userResponse.utilityHistory.length === 0) {
                return res.status(400).json({ message: 'No utility history found' });
            }

            console.log('[AnonUser] Found user with token:', token);
            return res.status(200).json(userResponse);
        } catch (error) {
            console.log('[AnonUser] Error retrieving user history:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },


    async generateSignedUrl(req, res, next) {
        const filename = req.query.filename;
        const contentType = req.query.contentType;

        if (!filename || !contentType) {
            return res.status(400).json({ error: 'Missing filename or contentType' });
        }

        console.log('Generating signed URL for file:', filename);

        const cleanedFilename = filename.replace(/[:\s]/g, '-');
        const nameWithoutExt = path.parse(cleanedFilename).name;

        const s3Key = `-${uid()}-${nameWithoutExt}`;

        const client = new S3Client();
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            ContentType: contentType
        });

        try {
            const url = await getSignedUrl(client, command, { expiresIn: 86400 }); // 24hrs
            res.send({ url, key: s3Key });
        } catch (error) {
            console.error('Failed to sign URL', error);
            res.status(500).json({ error: 'Failed to generate signed URL' });
        }
    },

    async downloadSignedUrl(req, res, next){
        const fileKey = req.query.key;
        const mode = req.query.mode || download;

        const client = new S3Client();
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            ...(mode === 'download' && {
                ResponseContentDisposition: 'attachment'
            })
        });

        try {
            const url = await getSignedUrl(client, command, { expiresIn: 3600 });
            res.send({url})
        } catch (error) {
            res.status(500).send({ error: 'Could not generate download URL' })
        }
    },

    async deleteSignedUrl(req, res, next){

        const s3Key = req.query.key;
        const client = new S3Client();
        
        try {            
            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME, 
                Key: s3Key,
            });

            await client.send(command)

            res.status(200).send({ message: 'Object deleted', key: s3Key })
        } catch (error) {
            res.status(500).send({ message: 'Error deleting object', error: error})
            console.log(error)
        }
    }

}