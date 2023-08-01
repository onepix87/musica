import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder } from 'discord.js';
import { LeaveDescription, LeaveResponse } from '../constants/locales';
import { PlayInteractionArguments } from '../types';
import { deletePlayer } from '../api/lavalink';
import { Colors } from '../constants/colors';
import { resolveLocale } from '../utils/resolve-locale';
import { queueList } from '../shared/queue';

const data = new SlashCommandBuilder()
  .setName('leave')
  .setDescription(LeaveDescription.default)
  .setDescriptionLocalizations({
    ru: LeaveDescription.ru,
  })
  .toJSON();

const execute = async (interaction: ChatInputCommandInteraction, { client, sessionId }: PlayInteractionArguments) => {
  const guild = interaction.guild as Guild;
  await deletePlayer(sessionId, guild.id);
  queueList.delete(guild.id);

  client.ws.shards.get(guild.shardId)?.send({
    op: 4,
    d: { shardId: guild.shardId, guild_id: guild.id, channel_id: null, self_mute: false, self_deaf: false },
  });

  await interaction.reply({
    embeds: [
      new EmbedBuilder().setColor(Colors.Default).setDescription(`${resolveLocale(interaction.locale, LeaveResponse)}`),
    ],
  });
};

export { data, execute };
