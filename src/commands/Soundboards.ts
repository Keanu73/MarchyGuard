/*import { Command, CommandMessage, Description, Guard } from "@typeit/discord";
import { NotBot } from "src/guards/NotBot";
import { Owner } from "src/guards/Owner";
import { config } from "config";
import fs from "fs";
import * as Path from "path";
import { Soundboard } from "src/modules/Soundboard";
import fetch from "node-fetch";

export abstract class Soundboards {
  @Command("add :name :filename")
  @Description("Adds a sound to the bot")
  @Guard(NotBot, Owner)
  async addSound(command: CommandMessage): Promise<void> {
    const { name, filename } = command.args;
    if (!filename && command.attachments.size === 1) {
      const file = command.attachments.array()[0];
      if (!file.url.endsWith(".mp3" || ".wav" || ".m4a")) void command.reply("File must end in .mp3, .wav or .m4a.");
      const result = fetch(file.url).then((res) => {
        const dest = fs.createWriteStream(Path.join(__dirname, "..", "..", "sounds", filename));
        res.body.pipe(dest);
      });
    } else if (filename) {
      Soundboard.addSound(name, Path.join(__dirname, "..", "..", "sounds", filename));
    }

    // Get sound, check if it exists in soundboard repository. Keyvalue pair in mongodb maybe? Or enmap?
    // Then if so, join voice channel, connection.play, on("finish") leave.
  }

  @Command("play :sound")
  @Description("Plays a sound from the soundboard repository")
  @Guard(NotBot)
  async playSound(command: CommandMessage): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sound = command.args.sound;

    // Get sound, check if it exists in soundboard repository. Keyvalue pair in mongodb maybe? Or enmap?
    // Then if so, join voice channel, connection.play, on("finish") leave.
  }
}
*/
