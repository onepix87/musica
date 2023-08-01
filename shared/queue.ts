import { Locale, Snowflake, TextChannel } from 'discord.js';
import { Track } from '../types';
import { updatePlayer } from '../api/lavalink';

type QueueInit = {
  sessionId: string;
  guildId: Snowflake;
};

export class Queue {
  public tracks: {
    track: Track;
    channel: TextChannel;
    locale: Locale;
    author: string;
  }[];

  private guildId: Snowflake;

  private sessionId: string;

  constructor({ sessionId, guildId }: QueueInit) {
    this.tracks = [];
    this.guildId = guildId;
    this.sessionId = sessionId;
  }

  async play() {
    return updatePlayer(this.sessionId, this.guildId, {
      encodedTrack: this.tracks.length > 0 ? this.tracks[0].track.encoded : null,
    });
  }

  async setPause(pause: boolean) {
    return updatePlayer(this.sessionId, this.guildId, {
      paused: pause,
    });
  }

  async unstuck(position: number) {
    return updatePlayer(this.sessionId, this.guildId, {
      encodedTrack: this.tracks[0].track.encoded,
      position,
    });
  }

  add(payload: Track | Track[], channel: TextChannel, locale: Locale, author: string) {
    this.tracks = this.tracks.concat(
      Array.isArray(payload)
        ? payload.map((track) => ({ track, channel, locale, author }))
        : { track: payload, channel, locale, author },
    );
  }

  async next() {
    this.tracks.shift();
    return this.play();
  }
}

export const queueList = new Map<Snowflake, Queue>();
