import { ChatInputCommandInteraction, EmbedBuilder, Guild, SlashCommandBuilder } from 'discord.js';
import { PauseDescription, PauseNoTrackResponse, PauseResponse } from '../constants/locales';
import { queueList } from '../shared/queue';
import { Colors } from '../constants/colors';
import { resolveLocale } from '../utils/resolve-locale';

const data = new SlashCommandBuilder()
  .setName('pause')
  .setDescription(PauseDescription.default)
  .setDescriptionLocalizations({
    ru: PauseDescription.ru,
  })
  .toJSON();

const execute = async (interaction: ChatInputCommandInteraction) => {
  const guild = interaction.guild as Guild;
  const queue = queueList.get(guild.id);

  if (!queue) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Warning)
          .setDescription(resolveLocale(interaction.locale, PauseNoTrackResponse)),
      ],
    });
  } else {
    queue.setPause(true);
    const currentTrack = queue.tracks[0];
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Default)
          .setDescription(
            `${resolveLocale(interaction.locale, PauseResponse)} [${currentTrack.track.info.title}](${
              currentTrack.track.info.uri
            })`,
          ),
      ],
    });
  }
};

export { data, execute };
