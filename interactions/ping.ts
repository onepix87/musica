import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with pong!')
  .setDescriptionLocalizations({
    ru: 'Отвечает pong!',
  })
  .toJSON();

const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply({ content: 'pong!', ephemeral: true });
};

export { data, execute };
