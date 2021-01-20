import { GuildMember, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";

export class VoiceChatModule {
  @On("voiceStateUpdate")
  async onJoiningVoice([oldState, newState]: VoiceState[], _client: Client): Promise<void> {
    const memberId = oldState.id ?? newState.id;
    const member = newState.member ?? (oldState.member as GuildMember) ?? newState.guild.members.resolve(memberId);
    // If they are a moderator, forget about it - they should be able to moderate the voice-chat channel
    if (member.roles.cache.find((role) => role.name === "Moderator")) return;
    // Fetch the AFK & voice-chat channel for later
    const afkChannelId = newState.guild.afkChannelID ?? (oldState.guild.afkChannelID as string);
    const afkChannel =
      newState.guild.afkChannel ?? (oldState.guild.afkChannel as VoiceChannel) ?? newState.guild.channels.resolveID(afkChannelId);
    const voiceChatChannel = newState.guild.channels.cache.find((channel) => channel.name === "voice-chat");
    // Fetch the two states' channels for more readable comparisons
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    // If they just joined a voice channel that isn't the AFK channel..
    if (!oldChannel && newChannel && newChannel !== afkChannel) {
      // Let them see the voice-chat channel, logging which voice channel they joined.
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${newChannel.name}`,
      );
      // However, if they just left a voice channel..
    } else if (oldChannel && !newChannel) {
      // Remove their permissions to see the voice channel
      void (voiceChatChannel as TextChannel).permissionOverwrites
        .get(member.id)
        ?.delete(`${member.user.username} left ${oldChannel.name}`);
      // If they move from the AFK channel to a voice channel..
    } else if (oldChannel && newChannel && newChannel !== afkChannel) {
      // Welcome them back
      void (voiceChatChannel as TextChannel).updateOverwrite(
        member,
        { VIEW_CHANNEL: true },
        `${member.user.username} joined ${newChannel.name}`,
      );
      // However, if they move to the AFK channel..
    } else if (oldChannel && newChannel && oldChannel !== afkChannel && newChannel === afkChannel) {
      // Remove their permissions so you can't just spy on #voice-chat
      void (voiceChatChannel as TextChannel).permissionOverwrites
        .get(member.id)
        ?.delete(`${member.user.username} left ${oldChannel.name}`);
    }
  }
}
