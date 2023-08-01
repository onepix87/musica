import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder } from 'discord.js';
import { LeaveResponse, StopDescription, StopResponse } from '../constants/locales';
import { PlayInteractionArguments } from '../types';
import { deletePlayer } from '../api/lavalink';
import { Colors } from '../constants/colors';
import { resolveLocale } from '../utils/resolve-locale';
import { queueList } from '../shared/queue';

const data = new SlashCommandBuilder()
  .setName('stop')
  .setDescription(StopDescription.default)
  .setDescriptionLocalizations({
    ru: StopDescription.ru,
  })
  .toJSON();

const execute = async (interaction: ChatInputCommandInteraction, { sessionId }: PlayInteractionArguments) => {
  const guild = interaction.guild as Guild;
  await deletePlayer(sessionId, guild.id);
  queueList.delete(guild.id);

  await interaction.reply({
    embeds: [
      new EmbedBuilder().setColor(Colors.Default).setDescription(`${resolveLocale(interaction.locale, StopResponse)}`),
    ],
  });
};

export { data, execute };
