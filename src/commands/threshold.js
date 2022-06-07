const { SlashCommandBuilder } = require("@discordjs/builders");
const { adminOnly } = require("../utils/guards")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("threshold")
    .setDescription(
      "Set the threshold for the amount of negativity you'll tolerate. (Higher = Allow More Negativity)"
    )
    .addNumberOption((option) =>
      option
        .setName("value")
        .setDescription("The threshold value")
        .setRequired(true)
    ),
  async execute(interaction) {
    const g = adminOnly(interaction); if (g) return g;

    const thresholdValue = interaction.options.getNumber("value");
    if (!(0 <= thresholdValue && thresholdValue <= 1)) {
      return interaction.reply(`The threshold value must be between 0 and 1.`);
    }
    const guildSettings = await interaction.client.database.guildSettings.upsert({
      where: {
        guildId: interaction.guildId,
      },
      update: {
        threshold: thresholdValue,
      },
      create: {
        guildId: interaction.guildId,
      }
    });
    if (guildSettings) {
      return interaction.reply(`The new threshold value is ${thresholdValue}`);
    } else {
      return interaction.reply("Something went wrong!");
    }
  },
};
