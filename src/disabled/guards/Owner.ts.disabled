import { GuardFunction } from "@typeit/discord";
import { config } from "../Config";

export const Owner: GuardFunction<"message"> = async ([message], _client, next) => {
  if (message.author.id === config.ownerID) {
    await next();
  }
};
