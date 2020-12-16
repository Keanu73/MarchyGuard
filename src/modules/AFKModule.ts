import { GuildMember, VoiceState } from "discord.js";
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
    const afkChannel = newState.guild.channels.cache.find((channel) => channel.name === "AFK");
    const member = (oldState.member as GuildMember) ?? (newState.member as GuildMember);
    // Get the timer - wrap it in my hacky class
    const timeout: BetterTimeout | undefined = timers.get(member.id);
    const controller = new AbortController();
    // If they are already in the AFK channel and were added to the queue or not, forget about it and/or remove them from the queue
    if (!timeout && newChannel === afkChannel) return;
    else if (timeout && newChannel === afkChannel) {
      // Abort the timeout - turn the key.
      timeout.controller.abort();
      // Remove them from the map so we don't accidentally fetch them later.
      timers.delete(member.id);
    }
    // If they aren't in the timer list and they aren't deafened either way, forget about it
    if (!timers.get(member.id) && !oldState.selfDeaf && !newState.selfDeaf) return;
    // If they just deafened and they aren't already timed, or if they joined deafened..
    if (!timeout && ((!oldDeaf && newDeaf) || (oldDeaf && newDeaf && !oldChannel))) {
      const signal = controller.signal;
      const timestamp = Date.now() + config.afkTimeout * 60000;
      // Create timeout that executes function at specific point in time depending on configured AFK timeout
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const newTimeout = setTimeout(config.afkTimeout * 60000, null, { signal: signal })
        .then(() => AFKTimeout(client, member.id))
        .catch((err: Error) => {
          // If aborted early, abort the timeout
          if (err.name === "AbortError")
            console.log(
              `[AFKMODULE] Member ${member.user.username} now removed from timeout @ ${new Date().getHours()}:${String(
                new Date().getMinutes(),
              ).padStart(2, "0")}`,
            );
        });
      // Wrap the timeout in a hacky class that allows me to add extra information on.. think of the controller as a key into the lock, and the timestamp the etching on the key
      const timeoutWrap = new BetterTimeout(newTimeout, controller, timestamp);
      // Add it to the timers map for checking later
      timers.set(member.id, timeoutWrap);
      console.log(
        `[AFKMODULE] Member ${member.user.username} now added to queue @ ${new Date().getHours()}:${String(
          new Date().getMinutes(),
        ).padStart(2, "0")}`,
      );
      // However, if they either: unmuted after they were added to the queue
      // Or if they left the channel..
    } else if (timeout && Date.now() / 1000 < timeout.timestamp / 1000) {
      if ((oldDeaf && !newDeaf) || (oldChannel && !newChannel)) {
        // Abort the timeout - turn the key.
        timeout.controller.abort();
        // Remove them from the map so we don't accidentally fetch them later.
        timers.delete(member.id);
      }
    }
  }
}

export const AFKTimeout = async (client: Client, id: string): Promise<void> => {
  // Fetch the guild for ease of use, force new cache
  const guild = await client.guilds.fetch(config.guildID, false, true);
  const afkChannel = guild.channels.cache.find((channel) => channel.name === "AFK");
  const member = await guild.members.fetch({ user: id, cache: false, force: true });
  if (afkChannel) {
    // Move person to AFK channel
    console.log(
      `[AFKMODULE] Member ${member.user.username} now moved to AFK channel @ ${new Date().getHours()}:${String(
        new Date().getMinutes(),
      ).padStart(2, "0")}`,
    );
    // Remove them from the timers map so we don't accidentally fetch them again
    timers.delete(member.id);
    void member.voice.setChannel(afkChannel, "User was AFK for 10 minutes");
  } else {
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
