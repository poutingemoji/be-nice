const { SlashCommandBuilder } = require("@discordjs/builders");
const { adminOnly } = require("../utils/guards")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disable")
    .setDescription("Stop blocking out the negativity."),
  async execute(interaction) {
    const g = adminOnly(interaction); if (g) return g;
    const guildSettings = await interaction.client.database.guildSettings.upsert(
      {
        where: {
          guildId: interaction.guildId,
        },
        update: {},
        create: {
          guildId: interaction.guildId
        },
      }
    );

    const updatedGuildSettings =
      await interaction.client.database.guildSettings.update({
        where: {
          guildId: interaction.guildId,
        },
        data: {
          disabled: !guildSettings.disabled,
        },
      });

    return interaction.reply(
      `I am now ${
        updatedGuildSettings.disabled ? "not " : ""
      }filtering out negativity.`
    );
  },
};
