import { GuildMember, VoiceState } from "discord.js";
import { Client, On } from "@typeit/discord";
import { config } from "../Config";
import { AbortController } from "abort-controller";
import { setTimeout } from "timers/promises";

export class AFKModule {
  @On("voiceStateUpdate")
  onVoiceUpdate([oldState, newState]: VoiceState[], client: Client): void {
    // If they are already in AFK channel, forget about it
    if (newState.channelID === config.afkChannel) return;
    const member = oldState.member as GuildMember;
    // If they aren't in the timer list and they aren't muted either way, forget about it
    if (!timers.get(member.id) && !oldState.selfMute && !newState.selfMute) return;
    // Get the timer
    const timeout: BetterTimeout | undefined = timers.get(member.id);
    const controller = new AbortController();
    // If they just muted and they aren't already timed..
    if (!timeout && (!oldState.selfMute || oldState.selfMute) && newState.selfMute) {
      const signal = controller.signal;
      const timestamp = Date.now();
      // Create timeout that executes function at specific point in time depending on configured AFK timeout
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const newTimeout = setTimeout(config.afkTimeout * 60000, null, { signal: signal })
        .then(() => AFKTimeout(client, member.id))
        .catch((err: Error) => {
          // If aborted early, abort the timeout
          if (err.message === "AbortError")
            console.log(
              `[AFKMODULE] Member ${
                member.user.username
              } now removed from timeout @ ${new Date().getHours()}:${new Date().getMinutes()}`,
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
    } else if (
      (timeout && Date.now() / 1000 < timeout.duration / 1000 && oldState.selfMute && !newState.selfMute) ||
      (timeout &&
        Date.now() / 1000 < timeout.duration / 1000 &&
        oldState.selfMute &&
        oldState.channel &&
        newState.selfMute &&
        !newState.channel)
    ) {
      // Abort the timeout - turn the key.
      timeout.controller.abort();
      // Remove them from the map so we don't accidentally fetch them later.
      timers.delete(member.id);
      console.log(
        `[AFKMODULE] Member ${
          member.user.username
        } now removed from queue @ ${new Date().getHours()}:${new Date().getMinutes()}`,
      );
    }
  }
}

export const AFKTimeout = async (client: Client, id: string): Promise<void> => {
  // Fetch the guild for ease of use, force new cache
  const guild = await client.guilds.fetch(config.guildID, false, true);
  const member = await guild.members.fetch({ user: id, cache: false, force: true });
  // Move person to AFK channel
  console.log(
    `[AFKMODULE] Member ${
      member.user.username
    } now moved to AFK channel @ ${new Date().getHours()}:${new Date().getMinutes()}`,
  );
  // Remove them from the timers map so we don't accidentally fetch them again
  timers.delete(member.id);
  void member.voice.setChannel("775136769187381269");
};

export class BetterTimeout {
  timeout: Promise<void | Promise<GuildMember>>;
  controller: AbortController;
  duration: number;

  constructor(timeout: Promise<void | Promise<GuildMember>>, controller: AbortController, duration: number) {
    this.timeout = timeout;
    this.controller = controller;
    this.duration = duration;
  }
}

export const timers: Map<string, BetterTimeout> = new Map<string, BetterTimeout>();
