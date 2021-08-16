/* import { MessageEmbed, Guild, TextChannel } from "discord.js";
import { Client } from "discordx";
import Youtube from "youtube.ts"
import { config } from "config";

export class YouTube {
    private static started: number;
    private static client: Client;

    static start(client: Client) {
        this.client = client;
        this.started = Date.now();
        console.info(`[TWITTER] listener started for users ${config.twitter.users} at ${new Date(this.started).toISOString()}`);

        const youtube = new Youtube(config.youtube.api_key)

        const stream = feed.stream("statuses/filter", { follow: config.twitter.users });
        stream.on("start", _ => console.info("[TWITTER] Started streaming"));
        stream.on("data", this.onTweet);
        stream.on("error", error => console.error(error));
        stream.on("end", _ => console.log("[TWITTER] Stopped streaming"));
    }

    static async onTweet(tweet: Tweet) {
        try {
            const created_utc = new Date(Date.parse(tweet.created_at.replace(/( \+)/, ' UTC$1')));
            // Forget about any previous submissions
            if (created_utc.getTime() < this.started) return;
            const start = Date.now();

            const newPost = new MessageEmbed()
                .setAuthor(`${tweet.user.name} (@${tweet.user.screen_name})`, tweet.user.profile_image_url_https, `https://twitter.com/${tweet.user.screen_name}`)
                .setColor("BLUE")
                .setFooter("Twitter", "https://abs.twimg.com/icons/apple-touch-icon-192x192.png")
                .setURL(`https://twitter.com/${tweet.user.screen_name}/${tweet.id_str}`)
                .setDescription(tweet.text)
                .setTimestamp(created_utc.getTime())

            // TODO: add entity support for things such as images & embeds

            const guild = this.client.guilds.cache.get(config.guildID);
            const channel = (guild as Guild).channels.cache.get(config.socialFeedChannel);
            (channel as TextChannel).send({ embed: newPost });

            const end = Date.now();

            console.log(`[TWITTER] POSTed submission ${tweet.text} by ${tweet.user.name} @ https://twitter.com/${tweet.user.screen_name}/${tweet.id_str} in ${end - start}ms`)
        } catch (err) {
            console.error(err);
        }
    }
}*/
