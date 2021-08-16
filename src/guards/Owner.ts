import { Next } from "discordx";
import { Client, CommandInteraction, Message } from "discord.js";
import { config } from "../Config";

export async function Owner(message: Message | CommandInteraction, client: Client, next: Next) {
  const member = message.member;
    if (member?.user.id === config.ownerID) {
        await next();
    }
};
