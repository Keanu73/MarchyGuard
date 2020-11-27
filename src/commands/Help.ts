import { ArgsOf, Client, Command } from "@typeit/discord";

export abstract class Help {
  @Command("help")
  async help([message]: ArgsOf<"message">, _client: Client): Promise<void> {
    void message.reply("REEEE");
    /*const cmds = Client.getCommands();
    console.log(cmds);
    console.log(message);
    const avatarURL = message?.client?.user?.avatarURL();
    const embed = new MessageEmbed()
      .setColor("0486FF")
      .setAuthor("MarchyGuard", avatarURL ? avatarURL : "", "https://github.com/Keanu73/MarchyGuard")
      .setThumbnail(avatarURL ? avatarURL : "")
      .setTitle("List of Commands");
    cmds.forEach((c: CommandInfos) => {
      console.log(c.prefix);
      embed.addField(`${c.prefix.toString()}${c.commandName.toString()}`, c.description, false);
    });
    void message.channel.send(embed);
    const embed = new MessageEmbed()
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