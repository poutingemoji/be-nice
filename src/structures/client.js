const fs = require("node:fs");
const path = require("node:path");
const { Client, Intents, Collection } = require("discord.js");
const { AutoPoster } = require("topgg-autoposter");

// Creating Client
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Requiring and setting commands to client
client.commands = new Collection();
const commandsPath = path.join(__dirname, "..", "commands")
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Requiring and setting events to client
const eventsPath = path.join(__dirname, "..", "events")
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  console.log(event.name);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

if (process.env.NODE_ENV === "production") {
  const ap = AutoPoster(process.env.TOPGG_TOKEN, client);
  ap.on("posted", () => {
    console.log("Posted stats to Top.gg!");
  });
}

// Login to Discord with client token
client.login(process.env.DISCORD_TOKEN);
client.on("debug", console.log).on("warn", console.log);
module.exports = client;
