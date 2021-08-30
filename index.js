const { Client, Collection, Message } = require('discord.js');
const { config } = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const client = new Client();
const db = require("quick.db");

client.commands = new Collection();
client.aliases = new Collection();
client.queue = new Map();
client.mongoose = require('./utils/mongoose');


client.categories = fs.readdirSync('./commands/');
  
config({
    path: `${__dirname}/.env`
});

client.on("ready", async () => {
    client.user.setStatus("online");
    const statuser = [
      () => `.help`,
      () => `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} utilisateurs`,
      () => `${client.guilds.cache.size} serveurs`,
      () => `Version 1.0.0`,
    ]
    let i = 0
    setInterval(() => {
      client.user.setActivity(statuser[i](), {type: 'WATCHING'});
      i = ++i % statuser.length
    }, 1e4);
});

['command'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

fs.readdir('./events/', (err, files) => {
    if (err) return console.error;
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const evt = require(`./events/${file}`);
        let evtName = file.split('.')[0];
        console.log(`Loaded event '${evtName}'`);
        client.on(evtName, evt.bind(null, client));
    });
});

client.mongoose.init();
client.login(process.env.TOKEN);