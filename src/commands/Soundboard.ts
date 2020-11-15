import { Command, CommandMessage, Description, Discord, Guard } from "@typeit/discord";
import { NotBot } from "src/guards/NotBot";
import { Owner } from "src/guards/Owner";
import { config } from "../Config";
import fs from "fs";
import * as Path from "path";
import { SoundRepository } from "../modules/database/repositories/SoundRepository";
import fetch from "node-fetch";

@Discord(`${config.prefix}sound`)
export abstract class Soundboards {
  private sounds: SoundRepository;

  constructor() {
    this.sounds = new SoundRepository();
  }

  @Command("add :name :filename")
  @Description("Adds a sound to the bot")
  @Guard(NotBot, Owner)
  addSound(message: CommandMessage): void {
    const { name, filename } = message.args;
    if (!filename && message.attachments.size === 1) {
      const file = message.attachments.array()[0];
      if (!file.url.endsWith(".mp3" || ".wav" || ".m4a")) void message.reply("File must end in .mp3, .wav or .m4a.");
      void fetch(file.url).then((res) => {
        const stream = fs.createWriteStream(Path.join(__dirname, "..", "..", "sounds", filename));
        res.body.pipe(stream, { end: false });
        stream.on("end", () => {
          stream.end();
          void this.sounds.createSound(name, Path.join(__dirname, "..", "..", "sounds", filename));
          void message.reply(`:white_check_mark: Sound successfully uploaded.`);
        });
        stream.on("error", (err: Error) => {
          stream.end();
          void console.error(err);
        });
      });
    } else if (filename && message.attachments.size === 0) {
      this.sounds.createSound(name, Path.join(__dirname, "..", "..", "sounds", filename));
    } else {
      void message.reply(":exclamation: No file or filename input found!");
    }

    // Get sound, check if it exists in soundboard repository. Keyvalue pair in mongodb maybe? Or enmap?
    // Then if so, join voice channel, connection.play, on("finish") leave.
  }

  @Command("edit :name :newName :newFilename")
  @Description("Edits an existing sound on the bot")
  @Guard(NotBot, Owner)
  editSound(message: CommandMessage): void {
    const { name, newName, newFilename } = message.args;
    if (!name) void message.reply(":cross: Please provide a name.");
    if (!newFilename && !newName && message.attachments.size === 1) {
      const file = message.attachments.array()[0];
      if (!file.url.endsWith(".mp3" || ".wav" || ".m4a")) void message.reply("File must end in .mp3, .wav or .m4a.");
      void fetch(file.url).then((res) => {
        const stream = fs.createWriteStream(Path.join(__dirname, "..", "..", "sounds", newFilename));
        res.body.pipe(stream, { end: false });
        stream.on("end", () => {
          stream.end();
          void this.sounds.editSound(name, undefined, Path.join(__dirname, "..", "..", "sounds", newFilename));
          void message.reply(`:white_check_mark: Sound successfully uploaded.`);
        });
        stream.on("error", (err: Error) => {
          stream.end();
          void console.error(err);
        });
      });
    } else if (newFilename && !newName)
      void this.sounds.editSound(name, undefined, Path.join(__dirname, "..", "..", "sounds", newFilename));
    else if (!newFilename && newName) void this.sounds.editSound(name, newName, undefined);
    else if (newFilename && newName)
      void this.sounds.editSound(name, newName, Path.join(__dirname, "..", "..", "sounds", newFilename));
  }

  @Command("remove :name")
  @Description("Removes an existing sound on the bot")
  @Guard(NotBot, Owner)
  removeSound(message: CommandMessage): void {
    const name: string = message.args.name;
    if (!name) void message.reply(":cross: Please provide a name.");
    void this.sounds.removeSound(name);
  }

  @Command("play :sound")
  @Description("Plays a sound from the soundboard repository")
  @Guard(NotBot)
  async playSound(message: CommandMessage): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const sound = await this.sounds.getSound(message.args.sound);

    if (sound && message.member?.voice.channel) {
      const connection = await message.member.voice.channel.join();
      const dispatcher = connection.play(Path.join(__dirname, "..", "..", "sounds", sound.filename));
      dispatcher.on("finish", () => {
        connection.disconnect();
      });
      dispatcher.destroy();
    }
  }
}
