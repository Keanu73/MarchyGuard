import { Command, CommandMessage, Discord, Description, Guard, Infos } from "@typeit/discord";
import { config } from "../Config";
import { VoiceConnection } from "discord.js";
import { Owner } from "../guards/Owner";
import fetch from "@adobe/node-fetch-retry";

@Discord(`${config.prefix}dj `)
export abstract class VirtualDJ {
  connection: VoiceConnection;
  @Command("start")
  @Guard(Owner)
  @Infos({ owner: true })
  @Description("Listens to Marchy's DJ loopback stream")
  async listen(message: CommandMessage): Promise<void> {
    try {
      console.log("[VIRTUALDJ] Attempting to ping stream URL...");
      await fetch(`http://${config.virtualdjIP}:8000/listen.mp3`, {
        retryOptions: {
          retryInitialDelay: 2000,
          retryBackoff: 5,
          socketTimeout: 50000,
        },
      });
      console.log("[VIRTUALDJ] Ping successful");
      const connection = await message?.member?.voice.channel?.join();
      const dispatcher = connection?.play(`http://${config.virtualdjIP}:8000/listen.mp3`);
      dispatcher?.on("start", () => {
        console.log("[VIRTUALDJ] Stream started");
        void message.reply(":white_check_mark: Started playing VirtualDJ stream!").then((msg) => {
          setTimeout(() => void msg.delete(), 5000);
        });
      });
      dispatcher?.on("error", (err) => {
        console.error(err);
      });
      dispatcher?.on("finish", () => {
        console.log("[VIRTUALDJ] Stream finished");
        connection?.disconnect();
        dispatcher?.destroy();
      });
    } catch (error) {
      if (error.name === "FetchError" && error.code === "ETIMEDOUT") {
        console.log("[VIRTUALDJ] Failed to connect after 1 retry");
        void message.reply(":negative_squared_cross_mark: Failed to connect to the stream after 1 retry").then((msg) => {
          setTimeout(() => void msg.delete(), 5000);
        });
      }
    }
  }
}
