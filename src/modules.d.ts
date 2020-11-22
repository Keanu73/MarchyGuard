declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: string;
      DISCORD_TOKEN: string;
      DISCORD_PREFIX: string;
      DISCORD_GUILD_ID: string;
      DISCORD_AFK_TIMEOUT: string;
      DISCORD_AGREEMENT_CHANNEL: string;
      DISCORD_OWNER_ID: string;
      DISCORD_SOCIAL_FEED_CHANNEL: string;

      SENTRY_DSN: string;

      TWITTER_API_KEY: string;
      TWITTER_API_SECRET: string;
      TWITTER_BEARER_TOKEN: string;
      TWITTER_ACCESS_KEY: string;
      TWITTER_ACCESS_SECRET: string;
      TWITTER_USERS: string;

      YOUTUBE_API_KEY: string;
    }
  }
}

export {};
