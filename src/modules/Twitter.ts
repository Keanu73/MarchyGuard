import { MessageEmbed, Guild, TextChannel } from "discord.js";
import { Client } from "@typeit/discord";
import TwitterClient from "twitter-api-client";
import { config } from "config";

export class Twitter {
  private static started: number;
  private static client: Client;

  static start(client: Client): void {
    this.client = client;
    this.started = Date.now();
    console.info(
      `[TWITTER] listener started for users ${config.twitter.users} at ${new Date(this.started).toISOString()}`,
    );

    const feed = new TwitterClient({
      apiKey: config.twitter.consumer_key,
      apiSecret: config.twitter.consumer_secret,
      accessToken: config.twitter.access_token_key,
      accessTokenSecret: config.twitter.access_token_secret,
    });

    const stream = feed.stream("statuses/filter", { follow: config.twitter.users });
    stream.on("start", () => console.info("[TWITTER] Started streaming"));
    stream.on("data", (t) => Twitter.onTweet(t));
    stream.on("error", (error) => console.error(error));
    stream.on("end", () => console.log("[TWITTER] Stopped streaming"));
  }

  static onTweet(tweet: Tweet): void {
    try {
      const created_utc = new Date(Date.parse(tweet.created_at.replace(/( \+)/, " UTC$1")));
      // Forget about any previous submissions
      if (created_utc.getTime() < this.started) return;
      const start = Date.now();

      const newPost = new MessageEmbed()
        .setAuthor(
          `${tweet.user.name} (@${tweet.user.screen_name})`,
          tweet.user.profile_image_url_https,
          `https://twitter.com/${tweet.user.screen_name}`,
        )
        .setColor("BLUE")
        .setFooter("Twitter", "https://abs.twimg.com/icons/apple-touch-icon-192x192.png")
        .setURL(`https://twitter.com/${tweet.user.screen_name}/${tweet.id_str}`)
        .setDescription(tweet.text)
        .setTimestamp(created_utc.getTime());

      // TODO: add entity support for things such as images & embeds

      const guild = this.client.guilds.cache.get(config.guildID);
      const channel = (guild as Guild).channels.cache.get(config.socialFeedChannel);
      (channel as TextChannel).send({ embed: newPost }).catch((err) => console.error(err));

      const end = Date.now();

      console.log(
        `[TWITTER] POSTed submission ${tweet.text} by ${tweet.user.name} @ https://twitter.com/${
          tweet.user.screen_name
        }/${tweet.id_str} in ${end - start}ms`,
      );
    } catch (err) {
      console.error(err);
    }
  }
}

class Tweet {
  created_at: string;
  id_str: string;
  text: string;
  user: User;
}

class User {
  id: number;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string;
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  created_at: string;
  favourites_count: number;
  verified: boolean;
  statuses_count: number;
  profile_image_url_https: string;
}
