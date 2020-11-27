import { GuildMember, TextChannel, VoiceState } from "discord.js";
import { Client, On } from "@pho3nix90/discordts";

export class VoiceChatModule {
  @On("voiceStateUpdate")
  async onJoiningVoice([oldState, newState]: VoiceState[], _client: Client): Promise<void> {
    const member = newState.member as GuildMember;
    // If they are a moderator, forget about it - they should be able to moderate the voice-chat channel
    if (member.roles.cache.find((role) => role.name === "Moderator")) return;
    // Fetch the AFK & voice-chat channel for later
    const afkChannel = newState.guild.channels.cache.find((channel) => channel.name === "AFK");
    const voiceChatChannel = newState.guild.channels.cache.find((channel) => channel.name === "voice-chat");
    // If they just joined a voice channel that isn't the AFK channel..
    // TODO: Investigate removing permission overwrites so we can keep the permissions as clean as possible
    if (!oldState.channel && newState.channel && newState.channel !== afkChannel) {
      // Let them see the voice-chat channel, logging which voice channel they joined.
      const voiceChannel = newState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
      // However, if they just left a voice channel..
    } else if (oldState.channel && !newState.channel) {
      // Remove their permissions to see the voice channel
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: false },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
      // If they move from the AFK channel to a voice channel..
    } else if (oldState.channel && newState.channel && newState.channel !== afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
      // However, if they move to the AFK channel..
    } else if (oldState.channel && newState.channel && oldState.channel !== afkChannel) {
      const voiceChannel = oldState.channel;
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: false },
        `${member.user.username} joined ${voiceChannel.name}`,
      );
    }
  }
}
