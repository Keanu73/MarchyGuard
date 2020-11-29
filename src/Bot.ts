import "reflect-metadata";
import { ClientUser, TextChannel } from "discord.js";
import { ArgsOf, Client, Discord, Once, On } from "@pho3nix90/discordts";
import { config } from "./Config";
import * as Sentry from "@sentry/node";
import { Twitter } from "./modules/Twitter";
import * as Path from "path";

export class App {
  private static _client: Client;

  static get client(): Client {
    return this._client;
  }

  static start(): void {
    this._client = new Client();

    if (process.env.NODE_ENV === "production") Sentry.init({ dsn: config.sentry_dsn, tracesSampleRate: 1.0 });

    void this._client.login(config.token, `${__dirname}/modules/*.{ts,js}`);
  }
}

@Discord(config.prefix, {
  import: [Path.join(__dirname, "/commands", "*.{ts,js}")],
})
export abstract class Bot {
  @Once("ready")
  async onReady(): Promise<void> {
    const guild = await App.client.guilds.fetch(config.guildID);
    const channel = guild.channels.cache.find((channel) => channel.name === config.agreementChannel ?? "lobby") as TextChannel;
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
        (App.client.user as ClientUser).tag
      } online`,
    );

    void App.client.user?.setPresence({
      activity: {
        name: "Marchy fly",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      },
    });

    if (process.env.NODE_ENV === "production") void Twitter.start(App.client);
  }

  @On("message")
  async onMessage([message]: ArgsOf<"message">): Promise<void> {
    if (message.author.bot) return;

    if (message.content.startsWith(config.prefix)) return;
  }
}

App.start();
