const express = require('express')
const router = express.Router();

const axios = require('axios')

const path = require('path');
const fs = require('fs');

const yts = require( 'yt-search' )
const ytdl = require('@distube/ytdl-core')

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
}

// YouTube things needed to download
const cookies = [
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967057,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-1PAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 1
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967089,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cr_Dycb8-Vl4KfPsFRmHC_QACgYKAVUSARASFQHGX2MiNfnaWu23Sa5NEyFWGawPgBoVAUF8yKrf7HFQvIKZHxtdJSS0AeLO0076",
        "id": 2
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850101,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzV3mbr-FYoU63H0_mh_beGcXaxW37XRF9rb5rqYfNhW8H_TlSlwM4C2FaOV1k51f3Gq",
        "id": 3
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963058.966946,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-1PSIDTS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjEBUFGohxMMo5M0zzeVMYygh1uFLIZAfdYnoCrAus5G01n2aaJWGMawyVgemQEGQGmVEAA",
        "id": 4
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967069,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__Secure-3PAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 5
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967099,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cdpDmid44NT853hwI7KNU8QACgYKAZwSARASFQHGX2MiXGJuEHNcsk0Ok2ZcsXkVBBoVAUF8yKoI_bju_tAUf0HqGo7BJFdv0076",
        "id": 6
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850123,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDCC",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzW1v-sSdPMGfXa-MqIi65XNf2AzJS-Zeu2MMQzUs8TSOpaXxx970Kb3Q0WbJGs9zz7A",
        "id": 7
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963058.967002,
        "hostOnly": false,
        "httpOnly": true,
        "name": "__Secure-3PSIDTS",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "sidts-CjEBUFGohxMMo5M0zzeVMYygh1uFLIZAfdYnoCrAus5G01n2aaJWGMawyVgemQEGQGmVEAA",
        "id": 8
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967036,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "tyldVkmzk1i1LLmg/AVooB68nK-5qQ_w5x",
        "id": 9
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1723428743.340725,
        "hostOnly": false,
        "httpOnly": true,
        "name": "GPS",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "1",
        "id": 10
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967016,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "Ai4-UNOGshSuT3OkL",
        "id": 11
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987059.785653,
        "hostOnly": false,
        "httpOnly": true,
        "name": "LOGIN_INFO",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "AFmmF2swRQIgOutHwcM6yhqYQEtAZadO29UvivsrOHuVzuYwwMjZH4YCIQCcyWLI634QOVXI--9MAsRJi4_vX9LFHkdQ43fbbyWBVg:QUQ3MjNmeksxNVhYeURWVHh3SEItTmNtM1dmdTk4YjFWeFlRdkhfVjZkRFVmNFk4ejNjVFIwSlhmMmdFTzNiZ0t0NEl6UDJXUmZRSlk5Mi1UbXhqMlAzeEUycEZIdzBHb1ZHVUxrSUh3TDNCVmZKQjVfeTdaUzRuZnNWanBiQ0ZZUXhTSGRiWEpaejJFaDd4OTZNMHg0ZU5abnQtRlpiVE9B",
        "id": 12
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987065.692163,
        "hostOnly": false,
        "httpOnly": false,
        "name": "PREF",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "tz=Australia.Sydney",
        "id": 13
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967047,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "urFcDNRfm-plixTN/AcmeU7TW8F-kt8TXr",
        "id": 14
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967078,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "g.a000mwjBs2CcxmT1D1fiw9tZgWSgMEaJqj4vlQw-ItWP6cnMW94cjBY1tDt92IlM6kO_dg3glgACgYKAcoSARASFQHGX2Minx9E5fvYQpPyl0kmUoUYYxoVAUF8yKoAml6V-CMoXSMMZbAvm30H0076",
        "id": 15
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1754963065.850025,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SIDCC",
        "path": "/",
        "sameSite": "unspecified",
        "secure": false,
        "session": false,
        "storeId": "1",
        "value": "AKEyXzWrYh9Tv_tPeVFeJTRW6j79fWcMoENjcFZGthD-PN1aJKHmvkPL1sVunPU6fbf7OpTt",
        "id": 16
    },
    {
        "domain": ".youtube.com",
        "expirationDate": 1757987058.967027,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "unspecified",
        "secure": true,
        "session": false,
        "storeId": "1",
        "value": "A9HpobxuBud1fTynA",
        "id": 17
    }
]
const agent = ytdl.createAgent(cookies)


router.route('/getTitle').post(async (req, res) => {
    try {
        const spotifyUrl = req.body.link;
        console.log(`[Spot] Spotify link obtained: ${spotifyUrl}`);

        // get ID out of URL
        const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]{22})/);
        if (!trackIdMatch) {
            return res.status(400).send('Invalid Spotify track URL');
        }
        const trackId = trackIdMatch[1];
        console.log('[Spot] Track ID obtained')

        console.log('[Spot] Searching for Track ID via Spotify')
        const response = await getTrackInfo(trackId)

        const trackData = response;
        const songName = trackData.name;
        const artistName = trackData.artists[0].name; 

        const trackTitle = songName;
        console.log(`[Spot] Track Title obtained: ${trackTitle}`)
        const trackArtist = artistName;
        console.log(`[Spot] Track Artist obtained: ${trackArtist}`)
        const fullTrack = `${trackArtist} - ${trackTitle}`

        console.log(fullTrack)
        res.send(fullTrack);
    } catch (error) {
        if (error === 401){
            getAccessToken(clientId, clientSecret, tokenUrl)
            return ('/getTitle').post(req, res)
        }
        console.error('Error fetching track information:', error);
        res.status(500).send('Failed to fetch track information');
    }
});

router.route('/downloadMp3').post(async (req, res) => {
    try {
        const spotifyUrl = req.body.link;
        console.log(`[Spot] Spotify link obtained: ${spotifyUrl}`);

        const trackIdMatch = spotifyUrl.match(/track\/([a-zA-Z0-9]{22})/);
        if (!trackIdMatch) {
            return res.status(400).send('Invalid Spotify track URL');
        }
        const trackId = trackIdMatch[1];
        console.log('[Spot] Track ID obtained');

        console.log('[Spot] Searching for Track ID via Spotify');
        const trackData = await getTrackInfo(trackId);

        // If no track or name or artists or artists length equals zero
        if (!trackData || !trackData.name || !trackData.artists || trackData.artists.length === 0) {
            console.log('[Spot] Invalid track data received');
            return res.status(500).send('Invalid track data received from Spotify');
        }

        const songName = trackData.name;
        const artistName = trackData.artists[0].name;

        const trackTitle = songName;
        console.log(`[Spot] Track Title obtained: ${trackTitle}`)
        const trackArtist = artistName;
        console.log(`[Spot] Track Artist obtained: ${trackArtist}`)
        const fullTrack = `${trackArtist} - ${trackTitle}`

        // Search for the track through youtube
        console.log(`[Spot] Searching YouTube for: ${fullTrack}`)
        const searchYoutube = await yts(fullTrack)
        const youtubeUrl = searchYoutube.all[0]?.url;

        console.log(`[Spot] YouTube URL found: ${youtubeUrl}`)

        // NOW TO BEGIN THE DOWNLOAD
        // Validate YouTube URL
        if(!ytdl.validateURL(youtubeUrl, { agent }))
            return res.status(500).send("Invalid YouTube URL")
        
        console.log('[Spot] Searching for video via YTDL')
        const info = await ytdl.getInfo(youtubeUrl, { agent })
        const title = info.videoDetails.title;
        console.log(`[Spot] Video successfully obtained: ${title}`)

        const formats = ytdl.filterFormats(info.formats || [], 'audioonly');
        console.log("[Spot] Checking audio formats")
        if (formats.length === 0) {
            return res.status(400).send("No audio formats found for the provided video");
        }

        const mp4Format = formats.find(format => format.container === 'mp4');

        if (!mp4Format) {
            return res.status(400).send("No MP4 format for the provided video");
        }
        console.log("[Spot] Audio formats found")

        console.log("[Spot] Creating WriteStream")
        const audioPath = path.join(process.cwd(), "temp", `${encodeURIComponent(title)}.m4a`);
        const audioWriteStream = fs.createWriteStream(audioPath);

        console.log("[Spot] Initiating process with ytdl")
        ytdl(youtubeUrl, { format: mp4Format, agent}).pipe(audioWriteStream);

        res.set({
            'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.m4a"`, // Change filename extension to .mp3 | m4a so MacOS likes it
            'Content-Type': 'audio/mp4',
        });

        audioWriteStream.on('finish', () => {
            console.log(`[Spot] Video successfully converted: ${title}`);
            res.download(audioPath, `${encodeURIComponent(title)}.m4a`, (error) => {
                if (error) {
                    console.log(error);
                    res.status(500).send("Error downloading file");
                } else {
                    fs.unlinkSync(audioPath);
                    console.log(`[Spot] File successfully deleted: ${audioPath}`)
                }
            });
        });

    } catch (error) {
        if (error.response && error.response.status === 429){
            res.status(420).json({
                error: 'Too Many Requests',
                message: 'Rate Limit exceeded. Try again later.',
                retryAfter: error.response.headers['retry-after'] || 120  // 120 seconds
            })
        } else {
            console.error('[Spot] Error fetching track information:', error);
            res.status(500).send('Failed to fetch track information');
        }
    }
});


module.exports = router;