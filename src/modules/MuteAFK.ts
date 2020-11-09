import { Client } from "@typeit/discord";
import { config } from "config";

export class MuteAFK {
  private started: number;
  private client: Client;
  private queue: QueueItem[];

  start(client: Client): void {
    this.client = client;
    this.started = Date.now();
    console.info(`[MUTEAFK] module started at ${new Date(this.started).toISOString()}`);
    // Check queue of logged AFK people every minute
    setInterval(() => {
      void this.queueProcess();
    }, 60000);
  }

  addToQueue(id: string, expiry: number): boolean {
    const result = this.queue.push(new QueueItem(id, expiry));
    if (result) return true;
    else return false;
  }

  checkQueue(id: string): boolean {
    const result = this.queue.find((item) => item.id === id);
    if (result) return true;
    else return false;
  }

  removeFromQueue(id: string): boolean {
    const result = this.queue.splice(this.queue.findIndex((item) => item.id === id));
    if (result) return true;
    else return false;
  }

  async queueProcess(): Promise<void> {
    const queue = this.queue;
    // Fetch the guild for ease of use, force new cache
    const guild = await this.client.guilds.fetch(config.guildID, false, true);
    for (const item of queue) {
      // Fetch member without caching
      const member = await guild.members.fetch({ user: item.id, cache: false, force: true });
      // If they have unmuted since the minute has passed, remove them from the queue
      if (!member.voice.selfMute) this.queue.splice(this.queue.indexOf(item));
      // If they have not reached the 10-minue threshold yet, break
      if (Date.now() / 1000 < item.expiry) break;
      // Move person to AFK channel
      void member.voice.setChannel("775136769187381269");
      // Remove item from queue
      this.queue.splice(this.queue.indexOf(item));
    }
  }
}

class QueueItem {
  constructor(id: string, expiry: number) {
    this.id = id;
    this.expiry = expiry;
  }

  id: string;
  expiry: number;
}
