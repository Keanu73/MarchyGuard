import "reflect-metadata";
import { ClientUser, MessageReaction, TextChannel, User } from "discord.js";
import { Client, Discord, On, Once } from "@typeit/discord";
import { config } from "./Config.ts.dev";
import * as Sentry from "@sentry/node";
import { Database } from "./modules/database/Database";
//import { Twitter } from "./modules/Twitter";

@Discord(config.prefix, {
  import: [`${__dirname}/commands/*.js`, `${__dirname}/commands/*.ts`],
})
export abstract class Bot {
  private client: Client;
  constructor() {
    if (config.sentry.enabled) Sentry.init({ dsn: config.sentry.dsn });

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
        name: "everyone.....",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      },
    });

    const channel = await this.client.channels.fetch(config.agreementChannelID);
    void (channel as TextChannel).messages.fetch(config.agreementMessageID);
    //Twitter.start(client);
  }

  @On("messageReactionAdd")
  async messageReactionAdd([reaction, user]: [MessageReaction, User], _client: Client): Promise<void> {
    const guild = reaction.message.guild;
    const member = guild?.members.resolve(user);

    // Check if message is the agreement message
    // If so, if they don't already have the Follower role, grant it
    if (reaction.message.id === config.agreementMessageID && !member?.roles.cache.has(config.newMemberRoleID)) {
      console.info(
        `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] Added ${
          user.username
        } to the server`,
      );
      void member?.roles.add(config.newMemberRoleID, "verification");
    }
  }
}
