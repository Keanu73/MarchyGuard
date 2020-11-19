import { GuildMember, TextChannel, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";
import { config } from "../Config.ts.dev";

export class VoiceChatModule {
  @On("voiceStateUpdate")
  async onJoiningVoice([oldState, newState]: VoiceState[], client: Client): Promise<void> {
    // If they are already in AFK channel, forget about it
    const voiceChatChannel = await client.channels.fetch(config.voiceChatChannel, false, true);
    const member = newState.member as GuildMember;
    if (!oldState.channel && newState.channel && newState.channelID !== config.afkChannel) {
      const voiceChannel = newState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    } else if (oldState.channel && !newState.channel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: false },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    } else if (oldState.channel && newState.channel && newState.channelID !== config.afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    } else if (oldState.channel && newState.channel && oldState.channelID !== config.afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: false },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    }
  }
}
