import { Client, Command, CommandMessage } from "@typeit/discord";

export abstract class TheWorstProducer {
  @Command("niklasisannoying")
  async niklasannoyingalert(message: CommandMessage, _client: Client): Promise<void> {
    void message.reply("REEEE");
  }
}
