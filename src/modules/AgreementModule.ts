import { On } from "@pho3nix90/discordts";
import { MessageReaction, User, TextChannel } from "discord.js";
import { config } from "../Config";

export abstract class AgreementModule {
  @On("messageReactionAdd")
  async messageReactionAdd([reaction, user]: [MessageReaction, User]): Promise<void> {
    // If the person who reacts is a bot (including this one), forget about it.
    if (user.bot) return;
    // Store guild, member and the role/channel so we can fetch them later.
    const guild = reaction.message.guild;
    const member = guild?.members.resolve(user);
    const newMemberRole = guild?.roles.cache.find((r) => r.name === "Follower");
    const agreementChannel = guild?.channels.cache.find(
      (channel) => channel.name === config.agreementChannel ?? "lobby",
    ) as TextChannel;

    // Check if message is the agreement message
    if (reaction.message.channel === agreementChannel && newMemberRole) {
      // Check if they have the Follower role already
      const memberHasRole = member?.roles.cache.array().includes(newMemberRole);
      if (!memberHasRole) {
        // If they don't have it, give them it.
        void member?.roles.add(newMemberRole, "Successfully verified");
        void reaction.users.remove(user);
        console.info(
          `[${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, "0")}] Added ${
            user.username
          } to the server`,
        );
      }
      // Otherwise, don't do anything.
    }
  }
}
