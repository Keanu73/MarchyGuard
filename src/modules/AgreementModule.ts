import { Client, On } from "@typeit/discord";
import { MessageReaction, User } from "discord.js";
import { config } from "../Config";

export abstract class AgreementModule {
  @On("messageReactionAdd")
  async messageReactionAdd([reaction, user]: [MessageReaction, User], client: Client): Promise<void> {
    if (user.id === client.user?.id) return;
    const guild = reaction.message.guild;
    const member = guild?.members.resolve(user);

    // Check if message is the agreement message
    // If so, if they don't already have the Follower role, grant it
    if (reaction.message.id === config.agreementMessageID && !member?.roles.cache.has(config.newMemberRoleID)) {
      void member?.roles.add(config.newMemberRoleID, "verification");
      void reaction.users.remove(user);
      console.info(
        `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] Added ${
          user.username
        } to the server`,
      );
    }
  }
}
