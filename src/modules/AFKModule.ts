import { Client } from "@typeit/discord";
import { config } from "config";

export class AFKClass {
  private started: number;
  private client: Client;
  private queue: Map<string, number>;

  start(client: Client): void {
    this.client = client;
    this.started = Date.now();
    console.info(`[AFKMODULE] started at ${new Date(this.started).toISOString()}`);
    // Check queue of logged AFK people every minute
    setInterval(() => {
      void this.queueProcess();
    }, 60000);
  }

  addToQueue(id: string, expiry: number): boolean {
    const result = this.queue.set(id, expiry);
    if (result) return true;
    else return false;
  }

  checkQueue(id: string): boolean {
    const result = this.queue.get(id);
    if (result) return true;
    else return false;
  }

  fetchExpiry(id: string): number {
    return this.queue.get(id) as number;
  }

  removeFromQueue(id: string): boolean {
    const result = this.queue.delete(id);
    if (result) return true;
    else return false;
  }

  async queueProcess(): Promise<void> {
    // Fetch the guild for ease of use, force new cache
    const guild = await this.client.guilds.fetch(config.guildID, false, true);
    for (const [id, expiry] of this.queue) {
      // Fetch member without caching
      const member = await guild.members.fetch({ user: id, cache: false, force: true });
      // If they have unmuted since the minute has passed, remove them from the queue
      if (!member.voice.selfMute) this.queue.delete(id);
      // If they have not reached the 10-minue threshold yet, break
      if (Date.now() / 1000 < expiry) break;
      // Move person to AFK channel
      void member.voice.setChannel("775136769187381269");
      // Remove item from queue
      this.queue.delete(id);
    }
  }
}

const AFKModule = new AFKClass();
export { AFKModule };
