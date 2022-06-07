const { Permissions } = require('discord.js');
exports.adminOnly = function adminOnly(interaction) {
  return !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && interaction.reply("This commmand is admin only, sorry you aren't important enough.")
}