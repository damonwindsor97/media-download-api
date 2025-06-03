require('dotenv').config()
const {Client, GatewayIntentBits} = require('discord.js')
const token = process.env.DISCORD_TOKEN;
const Updates = require('../server/models/Updates')

function DiscordBot() {
    const client = new Client({ 
        intents: [GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
        ] 
    });
    client.login(token)
    console.log('{ UPDATE BOT } Online')
    
    // Capture the messages real-time
    client.on('messageCreate', message => {
        if (message.channel.id === process.env.DISCORD_CHANNEL_ID){
            const lines = message.content.trim().split('\n').filter(line => line.trim() !== '');

            const UpdateTitle = lines[0] || '';
            const UpdateSubTitle = lines[1] || '';
            const UpdateMessage = lines.slice(2).join('\n');
            const UpdateAuthor = message.author.globalName;

            console.log('{ UPDATE BOT } Message received')
            // Save new update into MongoDB
            async function newUpdate() {
                const now = new Date();
                // idec i got claude to do this, formatting sucks
                const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                await Updates.create({
                    author: UpdateAuthor,
                    date: formattedDate,
                    title: UpdateTitle,
                    subTitle: UpdateSubTitle,
                    message: UpdateMessage
                })
            }
            newUpdate();
        }
    });



}

module.exports = DiscordBot;