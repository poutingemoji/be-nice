const { SlashCommandBuilder } = require("@discordjs/builders");
const { adminOnly } = require("../utils/guards")
const {prisma } = require("../lib/prisma")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addphrase")
    .setDescription("Add a positive phrase to the phrase bank.")
    .addStringOption((option) =>
      option
        .setName("phrase")
        .setDescription("The phrase to add to the bank")
        .setRequired(true)
    ),
  async execute(interaction) {
    const g = adminOnly(interaction); if (g) return g;

    const phrase = interaction.options.getString("phrase")
    console.log(prisma.guildSettings)
    const guildSettings = await prisma.guildSettings.upsert({
      where: {
        guildId: interaction.guildId,
      },
      update: {
        customPhrases: {
          push: phrase,
        },
      },
      create: {
        guildId: interaction.guildId,
        customPhrases: {
          set: phrase,
        },
      },
    });
    if (guildSettings) {
      return interaction.reply(`Custom Phrases in this server: *${guildSettings.customPhrases.join("\n")}*`)
    } else {
      return interaction.reply("Something went wrong!")
    }
  },
};
