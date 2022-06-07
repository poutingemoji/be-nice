const { SlashCommandBuilder } = require("@discordjs/builders");
const { adminOnly } = require("../utils/guards")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("labels")
    .setDescription("Enable/disable the labels you want to filter by.")
    .addStringOption((option) =>
      option
        .setName("label")
        .setDescription("The label to enable/disable")
        .setRequired(false)
        .addChoices(
          { name: "Identity Attack", value: "identity_attack" },
          { name: "Insult", value: "insult" },
          { name: "Obscene", value: "obscene" },
          { name: "Severe Toxicity", value: "severe_toxicity" },
          { name: "Sexual Explicit", value: "sexual_explicit" },
          { name: "Threat", value: "threat" },
          { name: "Toxicity", value: "toxicity" }
        )
    ),
  async execute(interaction) {
    const labelValue = interaction.options.getString("label");

    const guildSettings =
      await interaction.client.database.guildSettings.upsert({
        where: {
          guildId: interaction.guildId,
        },
        update: {},
        create: {
          guildId: interaction.guildId,
        },
      });
    if (!labelValue) {
      return interaction.reply(
        `Excluded labels: *${guildSettings.excludedLabels.join(", ")}*`
      );
    } else {
      const g = adminOnly(interaction); if (g) return g;
      let updatedGuildSettings;
      if (guildSettings?.excludedLabels.includes(labelValue)) {
        const index = guildSettings.excludedLabels.indexOf(labelValue);
        if (index > -1) {
          guildSettings.excludedLabels.splice(index, 1); // 2nd parameter means remove one item only
        }

        updatedGuildSettings =
          await interaction.client.database.guildSettings.update({
            where: { guildId: interaction.guildId },
            data: {
              excludedLabels: { set: guildSettings.excludedLabels },
            },
          });
      } else {
        updatedGuildSettings =
          await interaction.client.database.guildSettings.update({
            where: { guildId: interaction.guildId },
            data: {
              excludedLabels: { push: labelValue },
            },
          });
      }

      if (updatedGuildSettings) {
        return interaction.reply(
          `Excluded labels: *${updatedGuildSettings.excludedLabels.join(", ")}*`
        );
      } else {
        return interaction.reply("Something went wrong!");
      }
    }
  },
};
