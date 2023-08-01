import {
  ChatInputCommandInteraction,
  Client,
  GatewayVoiceServerUpdateDispatchData,
  GatewayVoiceStateUpdateDispatchData,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import EventEmitter from 'events';
import { LavalinkTrackEvents } from './constants/events';

export type PlayInteractionArguments = {
  client: Client;
  lavalink: EventEmitter;
  sessionId: string;
};

export interface Interaction {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  execute: (interaction: ChatInputCommandInteraction, interactionArguments?: PlayInteractionArguments) => Promise<void>;
}

export type InteractionsImport = Record<string, Interaction>;

export type VoiceUpdateData = Pick<GatewayVoiceServerUpdateDispatchData, 'token' | 'endpoint'> &
  Pick<GatewayVoiceStateUpdateDispatchData, 'session_id'>;

export interface LavalinkReadyPayload {
  resumed: boolean;
  sessionId: string;
}

export type TrackEndReason = 'finished' | 'loadFailed' | 'stopped' | 'replaced' | 'cleanup';

export type LavalinkEventPayload =
  | {
      type: LavalinkTrackEvents.TrackStartEvent;
      guildId: string;
      track: Track;
    }
  | {
      type: LavalinkTrackEvents.TrackEndEvent;
      guildId: string;
      track: Track;
      reason: TrackEndReason;
    }
  | {
      type: LavalinkTrackEvents.TrackStuckEvent;
      guildId: string;
      track: Track;
      thresholdMs: number;
    }
  | {
      type: LavalinkTrackEvents.TrackExceptionEvent;
      guildId: string;
      track: Track;
      exception: {
        message?: string;
        severity: 'common' | 'suspicious' | 'fault';
        cause: string;
      };
    }
  | {
      type: LavalinkTrackEvents.WebSocketClosedEvent;
      guildId: string;
      code: number;
      reason: string;
      byRemote: boolean;
    };

export type TrackInfo = {
  identifier: string;
  isSeekable: boolean;
  author: string;
  length: number;
  isStream: boolean;
  position: number;
  title: string;
  uri?: string;
  artworkUrl?: string;
  isrc?: string;
  sourceName: string;
};

export type Track = {
  encoded: string;
  info: TrackInfo;
  pluginInfo: {};
};

export type LoadResult =
  | {
      loadType: 'track';
      data: Track;
    }
  | {
      loadType: 'playlist';
      data: {
        info: {
          name: string;
          selectedTrack: number;
        };
        pluginInfo: {};
        tracks: Track[];
      };
    }
  | {
      loadType: 'search';
      data: Track[];
    }
  | {
      loadType: 'empty';
      data: {};
    }
  | {
      loadType: 'error';
      data: {
        message?: string;
        severity: 'common' | 'suspicious' | 'fault';
        cause: string;
      };
    };
