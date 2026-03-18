require('dotenv').config()
const {Client, GatewayIntentBits} = require('discord.js')
const token = process.env.DISCORD_TOKEN;

function DiscordBot() {
    const client = new Client({ 
        intents: [GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
        ] 
    });
    client.login(token)
    console.log('{ DISCORD BOT } Online')
    


    
}

module.exports = DiscordBot;