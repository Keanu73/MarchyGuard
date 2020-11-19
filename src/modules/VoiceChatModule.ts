import { GuildMember, TextChannel, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";
import { config } from "../Config";

export class VoiceChatModule {
  @On("voiceStateUpdate")
  async onJoiningVoice([oldState, newState]: VoiceState[], _client: Client): Promise<void> {
    // If they are already in AFK channel, forget about it
    // Check if mod
    // If so return
    const member = newState.member as GuildMember;
    if (member.roles.cache.find((role) => role.name === "Moderator")) return;
    const voiceChatChannel = newState.guild.channels.cache.find((channel) => channel.name === "voice-chat");
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
