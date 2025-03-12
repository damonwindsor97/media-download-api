const axios = require('axios')
const URL = require('../server/models/Urls')

const { customAlphabet } = require('nanoid-cjs');
const nanoid = customAlphabet('1234567890abcdef', 10);

const shortId = nanoid();

module.exports = {

    async testCallback(res, req, next) {
        try {
            console.log('test working')
            res.send('test working')
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    },

    async dbCall(req, res, next){
        
        try {
            let urls = await URL.find({}).exec();
            res.json(urls)
        } catch (error) {
            res.send(error)
        }
    },
    
    async shortUrl(req, res, next) {
        if (!req.body.url) {
            return res.status(400).json({ error: 'URL is required' });
        }
    
        try {
            console.log('Checking to see if URL exists in db')
            // First check if URL already exists
            let url = await URL.findOne({ originalUrl: req.body.url }).exec();
            if (url) {
                console.log('URL found in db, sending to user')
                return res.json({
                    short: `${process.env.URL.replace(/\/$/, '')}/${url.slug}`,
                    originalUrl: url.originalUrl
                });
            }
    
            // Validate the target URL / see if the link is legit
            console.log('Seeing if URL is live')
            const response = await axios.get(req.body.url.toString(), {
                validateStatus: (status) => status < 500,
                timeout: 5000
            });
            
            // Check if the response is not a 404 or another unexpected status
            if (response.status === 404) {
                return res.status(404).json({
                    error: 'URL not found',
                    status: response.status
                });
            }
            
            // Validate if the response data is JSON
            let isValidJson = false;
            try {
                JSON.parse(JSON.stringify(response.data));
                isValidJson = true;
            } catch (err) {
                console.log('Non-JSON response received:', response.data);
            }
            
            if (!isValidJson) {
                return res.status(400).json({
                    error: 'Received non-JSON response from target URL',
                    status: response.status
                });
            }
    
            // Create new short URL
            console.log('Creating new slug/short url id')
            const slug = shortId;
            const newUrl = await URL.create({
                originalUrl: req.body.url,
                slug: slug,
                createdAt: new Date()
            });
            
            // return the response in JSON, containing the short link which contains our server URL & the slug, OGlink and link status
            return res.json({
                short: `${process.env.URL.replace(/\/$/, '')}/${newUrl.slug}`,
                originalUrl: newUrl.originalUrl,
                status: response.status
            });
            
        } catch (error) {
            console.error('Error in shortUrl:', error);
            next(error);
        }
    },
    
    async getSlug(req, res, next) {
        console.log('Accessing slug:', req.params.slug);
        try {
            // queries the database for a URL object that matches the given slug
            const url = await URL.findOne({ slug: req.params.slug }).exec();
            console.log('Found URL:', url);
            
            if (!url) {
                console.log('URL not found');
                return res.status(404).send('Short URL not found'); 
            }
    
            console.log('Redirecting to:', url.originalUrl);
            
            // Ensure URL has proper protocol
            // Iff OG URL is found, prepares to redirect by checking if URL has valid protocol
            let redirectUrl = url.originalUrl;
            if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
                redirectUrl = 'https://' + redirectUrl;
            }

            // Add headers to prevent caching
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            
            // Perform the redirect
            return res.redirect(301, redirectUrl);
        } catch (error) {
            console.error('Error in getSlug:', error);
            next(error);
        }
    }

}