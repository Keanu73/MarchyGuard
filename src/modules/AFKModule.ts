import { GuildMember, VoiceChannel, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";
import { config } from "../Config";
import { AbortController } from "abort-controller";
import { setTimeout } from "timers/promises";

export class AFKModule {
  @On("voiceStateUpdate")
  onVoiceUpdate([oldState, newState]: VoiceState[], client: Client): void {
    // Define comparison variables
    const [oldChannel, newChannel, oldDeaf, newDeaf] = [oldState.channel, newState.channel, oldState.selfDeaf, newState.selfDeaf];
    // If they are already in the AFK channel, forget about it
    const afkChannelId = newState.guild.afkChannelID ?? (oldState.guild.afkChannelID as string);
    const afkChannel =
      newState.guild.afkChannel ?? (oldState.guild.afkChannel as VoiceChannel) ?? newState.guild.channels.resolveID(afkChannelId);
    const memberId = oldState.id ?? newState.id;
    const member = oldState.member ?? (newState.member as GuildMember) ?? newState.guild.members.resolve(memberId);
    // Get the timer - wrap it in my hacky class
    const timeout: BetterTimeout | undefined = timers.get(memberId);
    const controller = new AbortController();
    // If they are already in the AFK channel and were added to the queue or not, forget about it and/or remove them from the queue
    if (!timeout && newChannel === afkChannel) return;
    else if (timeout && newChannel === afkChannel) {
      // Abort the timeout - turn the key.
      timeout.controller.abort();
      // Remove them from the map so we don't accidentally fetch them later.
      timers.delete(memberId);
    }
    // If they aren't in the timer list and they aren't deafened either way, forget about it
    if (!timers.get(memberId) && !oldState.selfDeaf && !newState.selfDeaf) return;
    // If they just deafened and they aren't already timed, or if they joined deafened..
    if (!timeout && ((!oldDeaf && newDeaf) || (oldDeaf && newDeaf))) {
      // Exempt Renny-UK and the lads from being AFK if playing EFT
      if (member.presence.activities.find((activity) => activity.name.toLowerCase() === "escape from tarkov")) {
        console.log(`[AFKMODULE] Member ${member.user.username} has been exempted as they are playing Tarkov`);
        return;
      }
      const signal = controller.signal;
      const timestamp = Date.now() + config.afkTimeout * 60000;
      // Create timeout that executes function at specific point in time depending on configured AFK timeout
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const newTimeout = setTimeout(config.afkTimeout * 60000, null, { signal: signal })
        .then(() => AFKTimeout(client, newState))
        .catch((err: Error) => {
          // If aborted early, abort the timeout
          if (err.name === "AbortError")
            console.log(
              `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] [AFKMODULE] Member ${
                member.user.username
              } now removed from timeout`,
            );
        });
      // Wrap the timeout in a hacky class that allows me to add extra information on.. think of the controller as a key into the lock, and the timestamp the etching on the key
      const timeoutWrap = new BetterTimeout(newTimeout, controller, timestamp);
      // Add it to the timers map for checking later
      timers.set(memberId, timeoutWrap);
      console.log(
        `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] [AFKMODULE] Member ${
          member.user.username
        } now added to queue`,
      );
      // However, if they either: unmuted after they were added to the queue
      // Or if they left the channel..
    } else if (timeout && Date.now() / 1000 < timeout.timestamp / 1000) {
      if ((oldDeaf && !newDeaf) || (oldChannel && !newChannel)) {
        // Abort the timeout - turn the key.
        timeout.controller.abort();
        // Remove them from the map so we don't accidentally fetch them later.
        timers.delete(memberId);
      }
    }
  }
}

export const AFKTimeout = async (client: Client, state: VoiceState): Promise<void> => {
  // Fetch the guild for ease of use, force new cache
  const guild = await client.guilds.fetch(config.guildID, false, true);
  const member = state.member ?? (await guild.members.fetch({ user: state.id, cache: false, force: true }));
  if (!state.channel) timers.delete(state.id);
  const afkChannel = state.guild.afkChannelID;
  try {
    // Move person to AFK channel
    console.log(
      `[AFKMODULE] Member ${member.user.username} now moved to AFK channel @ ${new Date().getHours()}:${String(
        new Date().getMinutes(),
      ).padStart(2, "0")}`,
    );
    // Remove them from the timers map so we don't accidentally fetch them again
    timers.delete(state.id);
    void state.setChannel(afkChannel, "User was AFK for 10 minutes");
  } catch (e) {
    console.error(
      `[AFKMODULE] Moving ${member.user.username} to AFK channel failed @ ${new Date().getHours()}:${String(
        new Date().getMinutes(),
      ).padStart(2, "0")}`,
    );
  }
};

// BetterTimeout wraps the timeout (the lock), the AbortController (the key), and the approximate timestamp to abort the timeout against
export class BetterTimeout {
  timeout: Promise<void | Promise<GuildMember>>;
  controller: AbortController;
  timestamp: number;

  constructor(timeout: Promise<void | Promise<GuildMember>>, controller: AbortController, timestamp: number) {
    this.timeout = timeout;
    this.controller = controller;
    this.timestamp = timestamp;
  }
}

export const timers: Map<string, BetterTimeout> = new Map<string, BetterTimeout>();
