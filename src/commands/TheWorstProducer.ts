import { Command, CommandMessage } from "@pho3nix90/discordts";

export abstract class TheWorstProducer {
  @Command("niklasisannoying")
  async niklasannoyingalert(message: CommandMessage): Promise<void> {
    void message.reply("REEEE");
  }
}
