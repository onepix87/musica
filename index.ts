import dotenv from 'dotenv';
import { ChatInputCommandInteraction, Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import * as Interactions from './interactions';
import { InteractionsImport, LavalinkEventPayload } from './types';
import { createLavalinkListener, deletePlayer } from './api/lavalink';
import { LavalinkEvents, LavalinkTrackEvents } from './constants/events';
import { queueList } from './shared/queue';
import { Colors } from './constants/colors';
import { resolveLocale } from './utils/resolve-locale';
import { PlayResponse, TrackLoadFailed } from './constants/locales';

dotenv.config();

let sessionId = '';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
});

const lavalink = createLavalinkListener(process.env.APP_ID ?? '');

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

lavalink.once(LavalinkEvents.Ready, (payload) => {
  console.log('Lavalink node ready!');

  sessionId = payload.sessionId;
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
  const chatInteraction = interaction as ChatInputCommandInteraction;
  const interactionObj = (Interactions as InteractionsImport)[chatInteraction.commandName];

  try {
    await interactionObj.execute(chatInteraction, { client, lavalink, sessionId });
  } catch (e) {
    console.error(e);
  }
});

lavalink.on(LavalinkEvents.Event, async (event: LavalinkEventPayload) => {
  switch (event.type) {
    case LavalinkTrackEvents.TrackStartEvent: {
      const queue = queueList.get(event.guildId);
      if (queue) {
        const currentTrack = queue.tracks[0];

        await currentTrack.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Default)
              .setAuthor({
                name: resolveLocale(currentTrack.locale, PlayResponse),
                iconURL: process.env.AUTHOR_ICON ?? '',
              })
              .setDescription(`[${currentTrack.track.info.title}](${currentTrack.track.info.uri})`)
              .setThumbnail(currentTrack.track.info.artworkUrl ?? null)
              .setFooter({
                text: `${currentTrack.author}`,
              }),
          ],
        });
      }
      break;
    }
    case LavalinkTrackEvents.TrackEndEvent: {
      const queue = queueList.get(event.guildId);
      if (queue) {
        const currentTrack = queue.tracks[0];
        if (currentTrack) {
          if (event.reason === 'loadFailed') {
            await currentTrack.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(Colors.Error)
                  .setDescription(resolveLocale(currentTrack.locale, TrackLoadFailed)),
              ],
            });
          }
          if (event.reason !== 'replaced' && event.reason !== 'stopped') {
            const playerResponse = await queue.next();
          }
        }
      }
      break;
    }
    case LavalinkTrackEvents.TrackStuckEvent: {
      const queue = queueList.get(event.guildId);
      if (queue) {
        const playerResponse = await queue.unstuck(event.thresholdMs);
      }
      break;
    }
    case LavalinkTrackEvents.TrackExceptionEvent: {
      console.error(event.exception.cause);
      break;
    }
    case LavalinkTrackEvents.WebSocketClosedEvent:
      await deletePlayer(sessionId, event.guildId);
      queueList.delete(event.guildId);
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);
