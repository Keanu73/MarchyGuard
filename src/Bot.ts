import "reflect-metadata";
import { ClientUser, TextChannel } from "discord.js";
import { Client, Discord, Once } from "@typeit/discord";
import { config } from "./Config";
import * as Sentry from "@sentry/node";
import { Database } from "./modules/database/Database";
//import { Twitter } from "./modules/Twitter";

@Discord(config.prefix, {
  import: [`${__dirname}/commands/*.js`, `${__dirname}/commands/*.ts`],
})
export abstract class Bot {
  private client: Client;
  constructor() {
    if (config.sentry.enabled) Sentry.init({ dsn: config.sentry.dsn, tracesSampleRate: 1.0 });

    if (config.mongodb.enabled) void Database.initConnection().then(() => Database.importSounds());

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
    console.log(
      `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] ${
        (this.client.user as ClientUser).tag
      } online`,
    );
    void this.client.user?.setPresence({
      activity: {
        name: "Marchy FLIEEEE",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      },
    });

    const channel = await this.client.channels.fetch(config.agreementChannelID);
    const msg = await (channel as TextChannel).messages.fetch(config.agreementMessageID);
    try {
      void msg.react("✅");
    } catch (err) {
      console.info(err);
    }
    //Twitter.start(client);
  }
}
