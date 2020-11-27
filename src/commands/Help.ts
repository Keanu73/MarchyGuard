import { Command, CommandInfos, CommandMessage, Client, Description } from "@pho3nix90/discordts";
import { MessageEmbed } from "discord.js";

export abstract class Help {
  @Command("help")
  @Description("Gives you information about all commands or a specific command")
  help(message: CommandMessage): void {
    const cmds = Client.getCommands();
    const avatarURL = message?.client?.user?.avatarURL();
    const embed = new MessageEmbed()
      .setColor("0486FF")
      .setAuthor("MarchyGuard", avatarURL ?? "", "https://github.com/Keanu73/MarchyGuard")
      .setThumbnail(avatarURL ?? "")
      .setTitle("List of Commands");
    cmds.forEach((c: CommandInfos) => {
      embed.addField(`${c.prefix.toString()}${c.commandName.toString()}`, c.description, false);
    });

    void message.channel.send(embed);
    /*const embed = new MessageEmbed()
            .setColor("0486FF")
            .setAuthor("MarchyGuard", avatarURL ? avatarURL : "", "https://github.com/Keanu73/MarchyGuard")
            .setFooter("Made by Thomas van Tilburg and Keanu73 with ❤️", "https://i.imgur.com/1t8gmE7.png")
            .setThumbnail(avatarURL ? avatarURL : "")
            .setTitle(message.commandName)
            .setDescription(message.description)
            .addField("Usage", message.infos.Usage, true);
          void message.reply(embed);*/
  }
}
