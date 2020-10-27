import { User } from "discord.js";
import { Client, Discord, On } from "@typeit/discord";
import * as Path from "path";
import { config } from "config";
import { Twitter } from "src/modules/Twitter";

@Discord(config.prefix, {
  import: [Path.join(__dirname, "..", "commands", "*.ts")],
})
export class DiscordApp {
  @On("ready")
  onReady(client: Client): void {
    console.info(`${(client.user as User).tag} online with commands ${Client.getCommands().toString()}`);
    Twitter.start(client);
  }

  /*
  @On("guildMemberAdd")
  onJoin(client: Client, member: GuildMember): void {

  }

   @On("message")
    onMessage(
        [message]: ArgsOf<"message">,
    ) {
        // add levelling xp
    }*/
}
