import { GuildMember, TextChannel, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";

export class VoiceChatModule {
  @On("voiceStateUpdate")
  async onJoiningVoice([oldState, newState]: VoiceState[], _client: Client): Promise<void> {
    // If they are already in AFK channel, forget about it
    // Check if mod
    // If so return
    const member = newState.member as GuildMember;
    if (member.roles.cache.find((role) => role.name === "Moderator")) return;
    const afkChannel = newState.guild.channels.cache.find((channel) => channel.name === "AFK");
    const voiceChatChannel = newState.guild.channels.cache.find((channel) => channel.name === "voice-chat");
    if (!oldState.channel && newState.channel && newState.channel !== afkChannel) {
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
        {},
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    } else if (oldState.channel && newState.channel && newState.channel !== afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    } else if (oldState.channel && newState.channel && oldState.channel !== afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        {},
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    }
  }
}
