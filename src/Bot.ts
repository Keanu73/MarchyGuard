import "reflect-metadata";
import { ClientUser, TextChannel } from "discord.js";
import { Client, Discord, Once } from "@typeit/discord";
import { config } from "./Config";
import * as Sentry from "@sentry/node";
import { Twitter } from "./modules/Twitter";

@Discord(config.prefix, {
  import: [`${__dirname}/commands/*.js`, `${__dirname}/commands/*.ts`],
})
export abstract class Bot {
  private client: Client;
  constructor() {
    if (process.env.NODE_ENV === "production") Sentry.init({ dsn: config.sentry_dsn, tracesSampleRate: 1.0 });

    //if (config.mongodb.enabled) void Database.initConnection().then(() => Database.importSounds());

    this.client = new Client({
      classes: [
        `${__dirname}/commands/*.js`,
        `${__dirname}/commands/*.ts`,
        `${__dirname}/modules/*.js`,
        `${__dirname}/modules/*.ts`,
      ],
      variablesChar: ":",
    });

    void this.client.login(config.token);
  }

  @Once("ready")
  async onReady(): Promise<void> {
    const guild = await this.client.guilds.fetch(config.guildID);
    const channel = guild.channels.cache.find(
      (channel) => channel.name === config.agreementChannel ?? "lobby",
    ) as TextChannel;
    if (channel) {
      const messages = await channel.messages.fetch(undefined, true, true);
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
      `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] ${
        (this.client.user as ClientUser).tag
      } online`,
    );

    void this.client.user?.setPresence({
      activity: {
        name: "Marchy fly",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      },
    });

    if (process.env.NODE_ENV === "production") void Twitter.start(this.client);
  }
}
