import "reflect-metadata";
import { ClientUser, GuildMember, MessageReaction, User } from "discord.js";
import { Client, Discord, On, Once } from "@typeit/discord";
import { config } from "./Config";
import * as Sentry from "@sentry/node";
import { Database } from "./modules/database/Database";
//import { Twitter } from "./modules/Twitter";

@Discord(config.prefix, {
  import: ["./commands/**/(*.ts|*.js)", "./guards/**/(*.ts|*.js)", "./modules/**/(*.ts|*.js)"],
})
export class Bot {
  private client: Client;
  constructor() {
    if (config.sentry.enabled) Sentry.init({ dsn: config.sentry.dsn });

    this.client = new Client({
      classes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`],
      variablesChar: ":",
    });

    void this.client.login(config.token);
  }

  @Once("ready")
  onReady(): void {
    console.log(`${(this.client.user as ClientUser).tag} online with commands ${Client.getCommands().toString()}`);
    void this.client.user?.setPresence({
      activity: {
        name: "everyone.....",
        type: "WATCHING",
        url: "https://twitch.tv/Maarchy",
      },
    });
    void Database.initConnection();
    //Twitter.start(client);
  }

  @On("guildMemberAdd")
  onJoin(_client: Client, member: GuildMember): void {
    void member.send("Yo Marques brownlee");
  }

  @On("messageReactionAdd")
  reactionAdded(reaction: MessageReaction, user: User): void {
    // Check if message is the agreement message
    // If so, if they don't already have the Follower role, grant it
    if (
      reaction.message.id === config.agreementMessageID &&
      user.id === reaction.message.member?.id &&
      !reaction.message.member?.roles.cache.has(config.newMemberRoleID)
    )
      void reaction.message.member?.roles.add(config.newMemberRoleID);
  }
}
