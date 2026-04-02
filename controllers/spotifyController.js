require('dotenv').config()
const axios = require('axios')
const { ytsearch } = require('ruhend-scraper')
const yts = require( 'yt-search' )
const AnonUser = require('../server/models/AnonUsers');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const tokenUrl = 'https://accounts.spotify.com/api/token';
let spotifyToken = null;

const AnonUsers = require('../server/models/AnonUsers.js');

// Function to get Access Token for Spotify - function came from Spotify, just tweaked
async function getAccessToken() {
    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        spotifyToken = data.access_token;
        console.log('[Spot TOKEN] New token obtained');
        return spotifyToken;
    } catch (error) {
        console.error('[Spotify TOKEN] Error getting access token:', error);
        throw error;
    }
}

getAccessToken()
  .then(token => {
    console.log('[Spotify TOKEN] Access token:', token);
  })
  .catch(error => {
    console.error('Error:', error);
});

//  function to call spotify and double check our token is good to go!
async function getTrackInfo(trackId) {
    try {
        // Check to see if there's a token available, if there isnt then create one
        if (!spotifyToken) {
            console.log('[Spot TOKEN] No token available, obtaining new token');
            await getAccessToken();
        }
        // Make call to Spotify
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            }
        });
        return response.data;
    } catch (error) {
        // If the error response and status equals a 401, generate a new token
        if (error.response && error.response.status === 401) {
            console.log("[Spot TOKEN] Token expired, regenerating new token");
            await getAccessToken();
            return getTrackInfo(trackId);
        }
        console.error('[Spot] Error in getTrackInfo function:', error.message);
        throw new Error(`Failed to get track info: ${error.message}`);
    }
};

async function getPlaylistInfo(playlistId) {
    try {

        // Check to see if there's a token available, if there isnt then create one
        if (!spotifyToken) {
            console.log('[Spot TOKEN] No token available, obtaining new token');
            await getAccessToken();
        }
        // Make call to Spotify
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`
            }
        });

        return response.data;
    } catch (error) {
        // If the error response and status equals a 401, generate a new token
        if (error.response && error.response.status === 401) {
            console.log("[Spot TOKEN] Token expired, regenerating new token");
            await getAccessToken();
            return getPlaylistInfo(playlistId);
        }
        console.error('[Spot] Error in getTrackInfo:', error.message);
        throw new Error(`Failed to get track info: ${error.message}`);
    }
}

module.exports = {
    async testCallback(req, res, next){
        try {
            res.send('spotty')
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },


    async getTitle(req, res, next){

        try {
            const spotifyUrl = req.body.link;
            console.log('[Spotify] Link obtained: ', spotifyUrl);

            // get ID out of URL
            // Look for literal text 'track', then capture 22 characters that are either letters or numbers
            const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]{22})/);
            if (!trackIdMatch) {
                return res.status(400).send('Invalid Spotify track URL');
            }
            const trackId = trackIdMatch[1];
            console.log('[Spotify] Track ID obtained')

            console.log('[Spotify] Searching for Track ID via Spotify')
            const response = await getTrackInfo(trackId)
            console.log(response)

            res.send(response)
        } catch (error) {
            if (error === 401){
                getAccessToken(clientId, clientSecret, tokenUrl)
                return ('/getTitle').post(req, res)
            }
            console.error('Error fetching track information:', error);
            res.status(500).send('Failed to fetch track information');
        }
    },

    async getPlaylist(req, res, next){
        try {
            const token = req.cookies?.anon_token;
            const user = await AnonUser.findOne({ token });
        
            if(user && user.utilityHistory >= 50){
                return res.status(403).json({ error: 'Usage limit reached, please wait till your user expires'})
            }

            if(!user){
                return res.status(400).json({ error:'No guest user found, contact admin'})
            }

            const spotifyUrl = req.body.link;
            console.log('[Spotify > txt] Playlist ID obtained')
    
            const playlistIdMatch = spotifyUrl.match(/playlist\/([a-zA-Z0-9]{22})/);
            if (!playlistIdMatch){
                return res.status(400).send('Invalid Spotify playlist URL');
            };
    
            const playlistId = playlistIdMatch[1];
            console.log('[Spotify > txt]Track ID obtained')
    
            console.log('[Spotify > txt]Searching for Playlist ID via Spotify')
            const response = await getPlaylistInfo(playlistId)
    
            // Map through and grab title of each song
            const titles = response.tracks.items.map(item => item.track.name);
            // Map through and grab each artist/s
            const artists = response.tracks.items.map(item => item.track.artists.map(artist => artist.name).join(', '))
    
            // Putting each response onto a new line + nice format
            const formattedResponse = artists.map((artists, index) => `Track: ${artists} - ${titles[index]}`).join('\n');
    
            console.log('[Spotify > txt] Creating item for usage history')
            const usageItem = {
                type: 'Spotify Playlist to .txt Converter',
                timestamp: new Date(),
                details: {
                    playlistName: response.name,
                    playlistUrl: response.external_urls.spotify,
                }
            };

            console.log('[Spotify > txt] Updating Anon user with usage history');
            await AnonUser.findOneAndUpdate(
                { token },
                { $push: { utilityHistory: usageItem } },
                { new: true, upsert: true }
            )


            res.type('text/plain').send(formattedResponse); 
        } catch (error) {
            if (error === 401){
                getAccessToken(clientId, clientSecret, tokenUrl)
                return ('/getTitle').post(req, res)
            }
            console.error('Error fetching track information:', error);
            res.status(500).send('Failed to fetch track information');
        }
    },

    async downloadMp3(req, res, next) {
        try {
            const token = req.cookies?.anon_token;
            const user = await AnonUser.findOne({ token });

            if (user && user.utilityHistory >= 50) {
                return res.status(403).json({ error: 'Usage limit reached, please wait till your user expires' });
            }

            if (!user) {
                return res.status(400).json({ error: 'No guest user found, contact admin' });
            }

            const spotifyUrl = req.body.link;
            console.log('[Spotify > MP3] Link obtained: ', spotifyUrl);

            const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]{22})/);
            if (!trackIdMatch) {
                console.log('[Spotify > MP3] Invalid Spotify track URL');
                return res.status(400).send('Invalid Spotify track URL');
            }

            const trackId = trackIdMatch[1];
            console.log('[Spotify > MP3] Track ID obtained');

            console.log('[Spotify > MP3] Searching for Track ID via Spotify');
            const response = await getTrackInfo(trackId);

            const artistName = response.artists[0].name;
            const trackName = response.name;
            const fullTrack = `${artistName} - ${trackName}`;
            console.log('[Spotify > MP3] Full track: ', fullTrack);

            console.log('[Spotify > MP3] Searching for track via YouTube');
            const youtubeData = await yts(fullTrack);
            const videoId = youtubeData.all[0]?.videoId;
            console.log('[Spotify > MP3] YouTube video ID obtained: ', videoId);

            if (!videoId) {
                return res.status(404).send('Could not find track on YouTube');
            }

            console.log('[Spotify > MP3] Calling RapidAPI for MP3 link');
            const rapidApiResponse = await axios.get('https://youtube-mp36.p.rapidapi.com/dl', {
                params: { id: videoId },
                headers: {
                    'x-rapidapi-key': process.env.YOUTUBE_MP3_API_KEY,
                    'x-rapidapi-host': process.env.YOUTUBE_MP3_API_HOST
                }
            });

            const { link: mp3Url } = rapidApiResponse.data;
            console.log('[Spotify > MP3] MP3 link obtained, fetching and piping file');

            // Fetch the actual MP3 and pipe it back to the client
            const fileResponse = await axios.get(mp3Url, { responseType: 'stream' });

            const safeTitle = fullTrack.replace(/[^a-z0-9 \-_]/gi, '_'); 
            res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
            res.setHeader('Content-Type', 'audio/mpeg');
            // set track name to the x-filename header so the frontend can access it
            res.setHeader('x-filename', `${safeTitle}.mp3`);

            fileResponse.data.pipe(res);

            // Log usage 
            const usageItem = {
                type: 'Spotify > mp3 Converter',
                timestamp: new Date(),
                details: {
                    title: fullTrack,
                    source: spotifyUrl,
                    duration: response.duration_ms
                }
            };

            await AnonUsers.findOneAndUpdate(
                { token },
                { $push: { utilityHistory: usageItem } },
                { new: true, upsert: true }
            );

        } catch (error) {
            if (error === 401) {
                getAccessToken(clientId, clientSecret, tokenUrl);
                return ('/downloadMp3').post(req, res);
            }
            console.log('[Spotify > MP3] Error downloading MP3', error);
            res.status(500).send('[Spotify > MP3] Failed to download MP3');
        }
    }
}
