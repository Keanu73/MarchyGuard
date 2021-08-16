import "reflect-metadata";
import * as Path from "path";
import { Intents, Interaction, Message, GuildChannel, ThreadChannel, TextChannel } from "discord.js";
import { Client } from "discordx";
import { config } from "./Config";
import * as Sentry from "@sentry/node";
//import os from "os";
//import winston from "winston";
//import "winston-syslog";
import { Twitter } from "./modules/Twitter";

if (process.env.NODE_ENV === "production") Sentry.init({ dsn: config.sentry_dsn, tracesSampleRate: 1.0 });

const client = new Client({
  prefix: "!",
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  classes: [
    Path.join(__dirname, "commands", "**/*.{ts,js}"),
    Path.join(__dirname, "guards", "**/*.{ts,js}"),
    Path.join(__dirname, "modules", "**/*.{ts,js}"),
  ],
  botGuilds: [config.guildID ?? ""],
  presence: {
      activities: [{
        name: "Marchy stream",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      }],
    },
  silent: true,
});

client.on("ready", async () => {
  client.initApplicationCommands({ log: { forGuild: true, forGlobal: true } });
  const guild = await client.guilds.fetch(config.guildID);
  const channel = guild.channels.cache.find((c) => c.name === config.agreementChannel ?? "lobby") as TextChannel;
  if (channel) {
    const messages = await channel.messages.fetch({}, { cache: false, force: true });
    if (messages.size === 1) {
      const message = messages.first();
      if (message && message.reactions.cache.size === 0)
        try {
          void message.react("✅");
        } catch (err) {
          void console.error(err);
        }
    }
  }

    console.log(
      `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] ${client.user?.tag} online`,
    );

    if (process.env.TWITTER) void Twitter.start(client);
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

//client.on("messageCreate", (message: Message) => {
//  client.executeCommand(message);
//});

client.login(config.token ?? ""); // provide your bot token