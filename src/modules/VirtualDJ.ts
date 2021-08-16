import { ButtonComponent, Discord, Guard, Slash, SlashGroup } from "discordx";
import { config } from "../Config";
import { ButtonInteraction, CommandInteraction, Guild, GuildMember, MessageButton, MessageActionRow } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  StreamType,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  PlayerSubscription,
  getVoiceConnection
} from "@discordjs/voice";
import { Owner } from "../guards/Owner";

@Discord()
@Guard(Owner)
@SlashGroup("dj", "VirtualDJ module commands")
export abstract class VirtualDJ {
  player: AudioPlayer;
  subscription: PlayerSubscription | undefined;
  @Slash("start")
  async listen(interaction: CommandInteraction) {
    const member = await interaction.member as GuildMember;
    const voiceChannelId = member.voice.channelId;
    if (!voiceChannelId) {
      await interaction.reply(":negative_squared_cross_mark: You are not connected to a voice channel.");
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
      return;
    }
    const guild = await interaction.guild as Guild;
    await interaction.reply("Attempting to connect to VirtualDJ stream URL...");
    const resource = createAudioResource(`docs.google.com/uc?export=open&id=1TsEc_qwgCdC-QVySE2D3p2n9Pl8OPyMy`, { inputType: StreamType.Arbitrary });
    this.player = createAudioPlayer();
    this.player.play(resource);

    this.player.on(AudioPlayerStatus.Idle, () => {
      console.log("[VIRTUALDJ] Stream finished");
      if (this.subscription)
        this.subscription.unsubscribe();
      const connection = getVoiceConnection(config.guildID);
      if (connection)
        connection.destroy();
    });

    // If the player encounters an error, unsubscribe & destroy voice connection and player.
    this.player.on('error', error => {
      console.error(`Error with VirtualDJ player: ${error.message}`);
      if (this.subscription)
        this.subscription.unsubscribe();
      const connection = getVoiceConnection(config.guildID);
      if (connection)
        connection.destroy();
      if (this.player)
        this.player.stop(true);
      interaction.editReply(":negative_squared_cross_mark: An error occurred while playing the VirtualDJ stream");
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
    });
    // Check if audio stream is playing.
	  try {
	  	await entersState(this.player, AudioPlayerStatus.Playing, 5_000);
	  	// The player has entered the Playing state within 5 seconds
      console.log("[VIRTUALDJ] Started playing stream");
      const connection = joinVoiceChannel({
	      channelId: voiceChannelId,
	      guildId: config.guildID,
	      adapterCreator: guild.voiceAdapterCreator,
      });
      console.log("[VIRTUALDJ] Joined voice channel");

      // If bot has been disconnected, check whether they've either been moved to a different voice channel or if they were kicked by Discord/etc.
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
      	try {
      		await Promise.race([
      			entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
      			entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      		]);
      		// Seems to be reconnecting to a new channel - ignore disconnect
      	} catch (error) {
      		// Seems to be a real disconnect which SHOULDN'T be recovered from
          if (this.subscription)
            this.subscription.unsubscribe();
          if (connection)
            connection.destroy();
          if (this.player)
	          this.player.stop();
      	}
      });
      // Subscribe audio player to voice connection.
      this.subscription = connection.subscribe(this.player);
      // If no more audio is playing (stream has stopped), automatically disconnect.

      const stopBtn = new MessageButton()
        .setLabel("Stop Stream")
        .setEmoji("🛑")
        .setStyle("DANGER")
        .setCustomId("stopButton");

      const row = new MessageActionRow().addComponents(stopBtn);

      interaction.editReply({
        content: ":white_check_mark: Successfully started playing VirtualDJ stream!",
        components: [row],
      });
	  } catch (error) {
	  	// The player has not entered the Playing state and either:
	  	// 1) The 'error' event has been emitted and should be handled
	  	// 2) 5 seconds have passed
      console.error(error);
      console.log("[VIRTUALDJ] Failed to connect");
      const connection = getVoiceConnection(config.guildID);
      if (connection)
        connection.destroy();
      interaction.editReply(":negative_squared_cross_mark: Failed to connect to the VirtualDJ stream");
      setTimeout(() => {
        interaction.deleteReply();
      }, 5000);
	  }
  }

  // Stop button for interaction
  @ButtonComponent("stopButton")
  stopVirtualDJBtn(interaction: ButtonInteraction) {
    if (this.subscription)
      this.subscription.unsubscribe();
    if (this.player)
      this.player.stop(true);
    const connection = getVoiceConnection(config.guildID);
    if (connection)
      connection.destroy();
    interaction.editReply(":white_check_mark: Successfully stopped the VirtualDJ stream!");
    setTimeout(() => {
      interaction.deleteReply();
    }, 5000);
  }
}
