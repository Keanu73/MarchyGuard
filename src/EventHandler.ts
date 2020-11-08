import { GuildMember, User, VoiceState } from "discord.js";
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

  @On("guildMemberAdd")
  onJoin(_client: Client, member: GuildMember): void {
    void member.send("Yo Marques brownlee");
  }

  /*@On("guildMemberRemove")
  onLeave(_client: Client, member: GuildMember): void {
    void member.send("Yo Marques brownlee");
  }*/

  @On("voiceStateUpdate")
  onVoiceUpdate(oldState: VoiceState, newState: VoiceState): void {
    // Store timestamp joined, if muting starts, start counting (add timer into queue?) - if timer reaches threshold, move to AFK channel
    // otherwise destroy timer in queue
    //if (oldState.member.)
  }

  /*@On("message")
  onMessage(
      [message]: ArgsOf<"message">,
  ) {
      
  }*/
}
