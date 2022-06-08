const toxicity = require("@tensorflow-models/toxicity");
const phrases = [
  "Great game, everyone!",
  "It was an honor to play with you all. Thank you.",
  "Wishing you all the best.",
  "Good game! Best of luck to you all!",
  "Gee whiz! That was fun. Good playing!",
  "Well played. I salute you all.",
  "I'm wrestling with some insecurity issues in my life but thank you all for playing with me.",
  "Ah shucks... you guys are the best!",
  "It's past my bedtime. Please don't tell my mommy.",
  "I could really use a hug right now.",
  "I feel very, very small... please hold me...",
  "I'm trying to be a nicer person. It's hard, but I am trying, guys.",
  "C'mon, Mom! One more game before you tuck me in. Oops mistell.",
  "Mommy says people my age shouldn't suck their thumbs.",
  "For glory and honor! Huzzah comrades!",
];
const labels = [
  "identity_attack",
  "insult",
  "obscene",
  "severe_toxicity",
  "sexual_explicit",
  "threat",
  "toxicity",
];

module.exports = {
  name: "messageCreate",
  async execute(message) {
    if (message.author.id === message.client.id) return;
    const guildSettings =
      await message.client.database.guildSettings.findUnique({
        where: { guildId: message.guild.id },
      });
    if (guildSettings?.disabled) return;
    const labelsToInclude = labels.filter((label) =>
      guildSettings?.excludedLabels?.includes(label)
    );
    const threshold = guildSettings?.threshold || 0.85;
    const allPhrases = guildSettings
      ? [...phrases, ...guildSettings.customPhrases]
      : phrases;
    const model = await toxicity.load(threshold, labelsToInclude);
    const predictions = await model.classify([message.content]);
    if (predictions.some((p) => p.results.some((r) => r.match === true))) {
      await message.delete();
      const randPhrase =
        allPhrases[Math.floor(Math.random() * allPhrases.length)];
      const webhook = await message.channel.createWebhook(
        message.author.username,
        { avatar: message.author.displayAvatarURL() }
      );
      await webhook.send({
        content: randPhrase,
        username: message.author.username,
        avatarURL: message.author.displayAvatarURL(),
      });
      await webhook.delete();
    }
  },
};
