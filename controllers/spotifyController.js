const axios = require('axios')

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const tokenUrl = 'https://accounts.spotify.com/api/token';
let spotifyToken = null;

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
        console.error('[Spot TOKEN] Error getting access token:', error);
        throw error;
    }
}

getAccessToken()
  .then(token => {
    console.log('Access token:', token);
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
                Authorization: `Bearer ${spotifyToken}`
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
        console.error('[Spot] Error in getTrackInfo:', error.message);
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
            const spotifyUrl = req.body.link;
            console.log('[Spotify] Playlist ID obtained')
    
            const playlistIdMatch = spotifyUrl.match(/playlist\/([a-zA-Z0-9]{22})/);
            if (!playlistIdMatch){
                return res.status(400).send('Invalid Spotify playlist URL');
            };
    
            const playlistId = playlistIdMatch[1];
            console.log('[Spotify] Track ID obtained')
    
            console.log('[Spotify] Searching for Playlist ID via Spotify')
            const response = await getPlaylistInfo(playlistId)
    
            // Map through and grab title of each song
            const titles = response.tracks.items.map(item => item.track.name);
            // Map through and grab each artist/s
            const artists = response.tracks.items.map(item => item.track.artists.map(artist => artist.name).join(', '))
    
            // Putting each response onto a new line + nice format
            const formattedResponse = artists.map((artists, index) => `Artist: ${artists} - Song: ${titles[index]}`).join('\n');
    
            // Send to user as plain text
            res.type('text/plain').send(formattedResponse); 
        } catch (error) {
            // If we get a 401, we run the getToken function and rerun the request
            if (error === 401){
                getAccessToken(clientId, clientSecret, tokenUrl)
                return ('/getTitle').post(req, res)
            }
            console.error('Error fetching track information:', error);
            res.status(500).send('Failed to fetch track information');
        }
    }
    }
