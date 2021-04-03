import "dotenv/config";

export const config = {
  token: process.env.DISCORD_TOKEN,
  prefix: process.env.DISCORD_PREFIX,
  guildID: process.env.DISCORD_GUILD_ID,

  afkTimeout: Number(process.env.DISCORD_AFK_TIMEOUT),

  agreementChannel: process.env.DISCORD_AGREEMENT_CHANNEL,

  ownerID: process.env.DISCORD_OWNER_ID,
  socialFeedChannel: process.env.DISCORD_SOCIAL_FEED_CHANNEL,

  sentry_dsn: process.env.SENTRY_DSN,

  virtualdjIP: process.env.DISCORD_VIRTUALDJ_IP,

  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
    apiKeySecret: process.env.TWITTER_API_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
    accessTokenKey: process.env.TWITTER_ACCESS_KEY,
    accessTokenSecret: process.env.TWITTER_ACCESS_SECRET,
    users: process.env.TWITTER_USERS,
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
  },
};
