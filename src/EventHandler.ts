import { GuildMember, MessageReaction, User, VoiceState } from "discord.js";
import { Client, Discord, On } from "@typeit/discord";
import * as Path from "path";
import { config } from "config";
import { Twitter } from "src/modules/Twitter";
import { AFKModule } from "src/modules/AFKModule";

@Discord(config.prefix, {
  import: [Path.join(__dirname, "commands", "*.ts")],
})
export class DiscordApp {
  @On("ready")
  onReady(client: Client): void {
    console.info(`${(client.user as User).tag} online with commands ${Client.getCommands().toString()}`);
    //Twitter.start(client);
    AFKModule.start(client);
  }

  @On("guildMemberAdd")
  onJoin(_client: Client, member: GuildMember): void {
    void member.send("Yo Marques brownlee");
  }

  @On("voiceStateUpdate")
  onVoiceUpdate(oldState: VoiceState, newState: VoiceState): void {
    const member = oldState.member as GuildMember;
    if (!AFKModule.checkQueue(member.id) && !oldState.selfMute && !newState.selfMute) return;
    else if (!AFKModule.checkQueue(member.id) && !oldState.selfMute && newState.selfMute)
      AFKModule.addToQueue(member.id, Date.now() / 1000 + 60);
    else if (
      AFKModule.checkQueue(member.id) &&
      oldState.selfMute &&
      !newState.selfMute &&
      Date.now() / 1000 < AFKModule.fetchExpiry(member.id)
    )
      AFKModule.removeFromQueue(member.id);
  }

  @On("messageReactionAdd")
  reactionAdded(reaction: MessageReaction, user: User): void {
    // Check if message is the agreement message
    // If so, if they don't already have the Follower role, grant it
    if (
      reaction.message.id === config.agreementMessageID &&
      !reaction.message.member?.roles.cache.has("771095055963914322")
    )
      void reaction.message.member?.roles.add("771095055963914322");
  }

  /*@On("message")
  onMessage(
      [message]: ArgsOf<"message">,
  ) {
      
  }*/
}
