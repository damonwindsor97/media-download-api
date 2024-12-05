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

module.exports = {
    async testCallback(req, res, next){
        try {
            
        } catch (error) {
            console.log(error)
            res.status(500).send(error)
        }
    },


    async getTrackInfo(req, res, next){
        try {
            
        } catch (error) {
            
        }
    }
}