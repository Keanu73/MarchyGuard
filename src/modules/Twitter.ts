import { MessageEmbed, Guild, TextChannel } from "discord.js";
import { Client } from "@pho3nix90/discordts";
import { config } from "../Config";
import fetch from "node-fetch";

export class Twitter {
  private static started: number;
  private static client: Client;

  static async start(client: Client): Promise<void> {
    this.client = client;
    this.started = Date.now();
    console.info(`[TWITTER] Started at ${new Date(this.started).toISOString()}`);

    const stream = await this.streamTweets();
    let timeout = 0;

    if (stream)
      stream.on("timeout", () => {
        console.warn(`[TWITTER] Connection error - timed out ${timeout} times - trying again in `);
        setTimeout(() => {
          timeout++;
          void this.streamTweets();
        }, 2 ** timeout);
        void this.streamTweets();
      });
  }

  static async receiveStream(): Promise<NodeJS.ReadableStream | undefined> {
    const addRule = await fetch("https://api.twitter.com/2/tweets/search/stream/rules", {
      method: "POST",
      body: JSON.stringify({
        add: [{ value: "from:MarchyPC" }],
      }),
      headers: { Authorization: `Bearer ${config.twitter.bearerToken}`, "Content-Type": "application/json" },
    });

    if (!addRule.ok) {
      throw new Error(`${addRule.status}: ${addRule.statusText} @ ${addRule.url}`);
    } else {
      const streamResult = await fetch(
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        "https://api.twitter.com/2/tweets/search/stream?" +
          new URLSearchParams({
            "media.fields": "url,preview_image_url",
            "tweet.fields": "attachments,created_at,entities,referenced_tweets",
            "user.fields": "created_at,name,profile_image_url,username",
            expansions: "attachments.media_keys,author_id,referenced_tweets.id",
          }),
        {
          method: "GET",
          headers: { Authorization: `Bearer ${config.twitter.bearerToken}` },
        },
      ).catch((error) => console.error(error));

      if (streamResult && streamResult.ok && streamResult.body) {
        return streamResult.body;
      } else if (streamResult && !streamResult.ok) {
        throw new Error(`Error ${streamResult.status}: ${streamResult.statusText} @ ${streamResult.url}`);
      }

      return undefined;
    }
  }

  static async streamTweets(): Promise<NodeJS.ReadableStream | undefined> {
    const stream = await this.receiveStream();

    if (stream) {
      stream.on("start", () => console.info("[TWITTER] Started streaming"));
      stream.on("data", (t: Buffer) => {
        try {
          Twitter.onTweet(JSON.parse(t.toString()));
        } catch (e) {
          // Keep-alive
        }
      });
      stream.on("error", (error) => {
        if (error.code === "ETIMEDOUT") {
          stream.emit("timeout");
        } else {
          console.error(error);
        }
      });

      stream.on("end", () => console.log("[TWITTER] Stopped streaming"));

      return stream;
    } else {
      return undefined;
    }
  }

  static onTweet(data: TwitterData): void {
    try {
      const tweet = data.data;
      const user = data.includes.users[0];
      const created_utc = new Date(Date.parse(tweet.created_at.replace(/( \+)/, " UTC$1")));
      // Forget about any previous submissions
      if (created_utc.getTime() < this.started) return;
      const start = Date.now();

      const newPost = new MessageEmbed()
        .setAuthor(`${user.name} (@${user.username})`, user.profile_image_url, `https://twitter.com/${user.username}`)
        .setColor("BLUE")
        .setFooter("Twitter", "https://abs.twimg.com/icons/apple-touch-icon-192x192.png")
        .setURL(`https://twitter.com/${user.username}/${tweet.id}`)
        .setTimestamp(created_utc.getTime());

      if (data.includes.media) {
        if (data.includes.media[0].type === "photo" && data.includes.media[0].url) {
          const image = data.includes.media[0].url;
          newPost.setImage(image);
          tweet.text = tweet.text.replace(` ${tweet.entities.urls[0].url}`, "");
        } else if (
          data.includes.media[0].type === ("animated_gif" || "video") &&
          data.includes.media[0].preview_image_url
        ) {
          const previewImage = data.includes.media[0].preview_image_url;
          newPost.setImage(previewImage);
        }
      }

      newPost.setDescription(tweet.text);

      const guild = this.client.guilds.cache.get(config.guildID);
      const channel = (guild as Guild).channels.cache.find((channel) => channel.name === config.socialFeedChannel);
      (channel as TextChannel).send({ embed: newPost }).catch((err) => console.error(err));

      const end = Date.now();

      console.log(
        `[TWITTER] POSTed submission ${tweet.text} by ${user.name} @ https://twitter.com/${user.username}/${
          tweet.id
        } in ${end - start}ms`,
      );
    } catch (err) {
      console.error(err);
    }
  }
}

class TwitterData {
  includes: {
    media: Media[];
    users: User[];
  };

  data: Tweet;
}

class Tweet {
  created_at: string;
  id: string;
  text: string;
  entities: {
    urls: EntityURL[];
  };
}

class EntityURL {
  start: number;
  end: number;
  url: string;
  expanded_url: string;
  display_url: string;
}

class User {
  name: string;
  username: string;
  created_at: string;
  profile_image_url: string;
}

class Media {
  url?: string;
  preview_image_url?: string;
  media_key: string;
  type: string;
}
