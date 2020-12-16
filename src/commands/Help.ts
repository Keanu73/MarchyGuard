import { Command, CommandInfos, CommandMessage, Client, Description } from "@typeit/discord";
import { MessageEmbed } from "discord.js";

export abstract class Help {
  @Command("help :section :cmd")
  @Description("Gives you information about all commands or a specific command")
  async help(message: CommandMessage): Promise<void> {
    const cmds = Client.getCommands();
    const avatarURL = message?.client?.user?.avatarURL();
    const keanuUser = await message?.client?.users.fetch("115156616256552962");
    const keanuAvatarURL = keanuUser.avatarURL();
    if (message.args.section || message.args.cmd) {
      const firstCmd = cmds.find((c) => c.commandName.toString().includes(message.args.section));
      const secondCmd = cmds.find((c) => c.commandName.toString().includes(message.args.cmd));
      const cmd = secondCmd ?? firstCmd ?? null;
      if (!firstCmd && !secondCmd && !cmd) void message.reply("The command you provided could not be found.");
      else if (cmd) {
        const embed = new MessageEmbed()
          .setColor("0486FF")
          .setAuthor("MarchyGuard", avatarURL ?? "https://i.imgur.com/Hg537KB.png", "https://github.com/Keanu73/MarchyGuard")
          .setFooter("Made by Keanu73 with ❤️", keanuAvatarURL ?? "https://i.imgur.com/UUtTUNB.gif")
          .setThumbnail(avatarURL ?? "https://i.imgur.com/Hg537KB.png")
          .setTitle(`${cmd.prefix.toString()}${cmd.commandName.toString()}`)
          .setDescription(cmd.description);
        void message.reply(embed);
      }
    } else {
      const embed = new MessageEmbed()
        .setColor("0486FF")
        .setAuthor("MarchyGuard", avatarURL ?? "https://i.imgur.com/Hg537KB.png", "https://github.com/Keanu73/MarchyGuard")
        .setThumbnail(avatarURL ?? "https://i.imgur.com/Hg537KB.png")
        .setFooter("Made by Keanu73 with ❤️", keanuAvatarURL ?? "https://i.imgur.com/UUtTUNB.gif")
        .setTitle("List of Commands");
      cmds.forEach((c: CommandInfos) => {
        embed.addField(`${c.prefix.toString()}${c.commandName.toString()}`, c.description, false);
      });

      void message.channel.send(embed);
    }
  }
}
