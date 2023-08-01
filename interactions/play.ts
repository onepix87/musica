import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { Colors } from '../constants/colors';
import {
  NetworkError,
  NotFoundError,
  NotInVoiceChannelWarn,
  PlayDescription,
  PlayQueryDescription,
  TrackAddedToQueue,
  UnknownError,
} from '../constants/locales';
import { resolveLocale } from '../utils/resolve-locale';
import { getVoiceUpdateData, sendVoiceUpdate } from '../api/discord';
import { resolveQuery, updatePlayer } from '../api/lavalink';
import { LoadResult, PlayInteractionArguments, VoiceUpdateData } from '../types';
import { Queue, queueList } from '../shared/queue';

const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription(PlayDescription.default)
  .setDescriptionLocalizations({
    ru: PlayDescription.ru,
  })
  .addStringOption((option) =>
    option
      .setName('query')
      .setNameLocalizations({
        ru: 'запрос',
      })
      .setDescription(PlayQueryDescription.default)
      .setDescriptionLocalizations({
        ru: PlayQueryDescription.ru,
      })
      .setRequired(true),
  )
  .toJSON();

const execute = async (interaction: ChatInputCommandInteraction, { client, sessionId }: PlayInteractionArguments) => {
  const user = interaction.member as GuildMember;
  const guild = interaction.guild as Guild;

  if (!user.voice.channel)
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Warning)
          .setDescription(resolveLocale(interaction.locale, NotInVoiceChannelWarn)),
      ],
    });

  let query = interaction.options.getString('query') ?? '';

  try {
    new URL(query);
  } catch (_) {
    query = `ytsearch:${query}`;
  }

  let queryResponse: LoadResult;

  try {
    queryResponse = await resolveQuery(query);
  } catch (e) {
    console.error(e);

    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(Colors.Error).setDescription(resolveLocale(interaction.locale, UnknownError)),
      ],
    });
  }

  if (queryResponse.loadType === 'empty')
    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(Colors.Warning).setDescription(resolveLocale(interaction.locale, NotFoundError)),
      ],
    });

  if (queryResponse.loadType === 'error') {
    console.error(queryResponse.data.cause);

    return interaction.reply({
      embeds: [
        new EmbedBuilder().setColor(Colors.Error).setDescription(resolveLocale(interaction.locale, UnknownError)),
      ],
    });
  }

  const queue = queueList.get(guild.id) ?? new Queue({ sessionId, guildId: guild.id });
  const playing = queue.tracks.length > 0;

  if (!queueList.has(guild.id)) {
    sendVoiceUpdate(client, {
      shardId: guild.shardId,
      guild_id: guild.id,
      channel_id: user.voice.channelId,
      self_mute: false,
      self_deaf: false,
    });

    let voiceData: VoiceUpdateData;

    try {
      voiceData = await getVoiceUpdateData(client, guild.id);
    } catch (e) {
      console.error(e);

      return interaction.reply({
        embeds: [
          new EmbedBuilder().setColor(Colors.Error).setDescription(resolveLocale(interaction.locale, NetworkError)),
        ],
      });
    }
    updatePlayer(sessionId, guild.id, {
      voice: {
        token: voiceData.token,
        sessionId: voiceData.session_id,
        endpoint: voiceData.endpoint ?? '',
      },
    });

    queueList.set(guild.id, queue);
  }

  switch (queryResponse.loadType) {
    case 'playlist': {
      const selectedTrack = queryResponse.data.info.selectedTrack;
      const tracks = selectedTrack === -1 ? queryResponse.data.tracks : queryResponse.data.tracks.slice(selectedTrack);
      queue.add(tracks, interaction.channel as TextChannel, interaction.locale, user.user.displayName);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Default)
            .setDescription(
              `[${queryResponse.data.info.name}](${query}) ${resolveLocale(interaction.locale, TrackAddedToQueue)}`,
            ),
        ],
      });
      break;
    }
    case 'search': {
      queue.add(queryResponse.data[0], interaction.channel as TextChannel, interaction.locale, user.user.displayName);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Default)
            .setDescription(
              `[${queryResponse.data[0].info.title}](${queryResponse.data[0].info.uri}) ${resolveLocale(
                interaction.locale,
                TrackAddedToQueue,
              )}`,
            ),
        ],
      });
      break;
    }
    case 'track': {
      queue.add(queryResponse.data, interaction.channel as TextChannel, interaction.locale, user.user.displayName);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Default)
            .setDescription(
              `[${queryResponse.data.info.title}](${queryResponse.data.info.uri}) ${resolveLocale(
                interaction.locale,
                TrackAddedToQueue,
              )}`,
            ),
        ],
      });
      break;
    }
  }

  if (!playing) await queue.play();
};

export { data, execute };
