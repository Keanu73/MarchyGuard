import { Client, On } from "@typeit/discord";
import { MessageReaction, User, TextChannel } from "discord.js";
import { config } from "../Config";

export abstract class AgreementModule {
  @On("messageReactionAdd")
  async messageReactionAdd([reaction, user]: [MessageReaction, User], client: Client): Promise<void> {
    if (user.id === client.user?.id) return;
    const guild = reaction.message.guild;
    const member = guild?.members.resolve(user);
    const newMemberRole = guild?.roles.cache.find((r) => r.name === "Follower");
    const agreementChannel = guild?.channels.cache.find(
      (channel) => channel.name === config.agreementChannel ?? "lobby",
    ) as TextChannel;

    // Check if message is the agreement message
    // If so, if they don't already have the Follower role, grant it
    if (reaction.message.channel === agreementChannel && newMemberRole) {
      const memberHasRole = member?.roles.cache.array().includes(newMemberRole);
      if (!memberHasRole) {
        void member?.roles.add(newMemberRole, "Successfully verified");
        void reaction.users.remove(user);
        console.info(
          `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] Added ${
            user.username
          } to the server`,
        );
      }
    }
  }
}
