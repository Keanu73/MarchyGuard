import { Message } from "discord.js";
import { Command, CommandMessage } from "@typeit/discord";
import { config } from "config";
import { Reddit } from "src/modules/Reddit";

export abstract class Verify {
  @Command("verify")
  async verify(command: CommandMessage): Promise<void> {
    if (config.reddit.verification) {
      const reddit = Reddit.client;
      const filter = (response: Message) => {
        return response.content.toLowerCase() === reddit.getUser(response.content.toLowerCase()).name;
      };
      await command.delete({ reason: "Verification process" });
      await command.author
        .send("Please send your reddit username here. You have 30 seconds for each message.")
        .then(() => {
          command.author.dmChannel
            .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
            .then((collected) => {
              command.author.dmChannel.send(`${collected.first().author} got the correct answer!`).then();
            })
            .catch((collected) => {
              message.channel.send("Looks like nobody got the answer this time.");
            });
        });
    }
  }
}
