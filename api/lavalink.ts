import WebSocket from 'ws';
import EventEmitter from 'events';
import { URLSearchParams } from 'url';
import { Snowflake } from 'discord.js';
import { RequestInit } from 'undici';
import { LoadResult } from '../types';

type PlayerUpdateData = {
  encodedTrack?: string | null;
  identifier?: string;
  position?: number;
  endTime?: number;
  volume?: number;
  paused?: boolean;
  voice?: {
    token: string;
    endpoint: string;
    sessionId: string;
  };
};

type OptionsType = RequestInit & { params?: Record<string, string> };

const _request = async (endpoint: string, data: Record<string, unknown>, options?: OptionsType) => {
  const url = new URL(
    `${process.env.LAVA_REST_PROTOCOL}://${process.env.LAVA_URL}/${process.env.LAVA_VERS}${endpoint}`,
  );

  const headers = new Headers(options?.headers as Record<string, string>);
  headers.set('Authorization', process.env.LAVA_AUTH ?? '');

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 5000);
  const method = options?.method ?? 'GET';

  url.search = new URLSearchParams({
    ...(method === 'GET' ? (data as Record<string, string>) : {}),
    ...(options?.params ?? {}),
  }).toString();

  const response = await fetch(url.toString(), {
    method,
    headers,
    signal: abortController.signal,
    ...(method !== 'GET' ? { body: JSON.stringify(data) } : {}),
  }).finally(() => clearTimeout(timeout));

  if (response.status === 200) return response.json();
};

export const resolveQuery = async (identifier: string): Promise<LoadResult> => {
  return _request('/loadtracks', { identifier }) as Promise<LoadResult>;
};

export const updatePlayer = async (sessionId: string, guildId: string, data: PlayerUpdateData) => {
  return _request(`/sessions/${sessionId}/players/${guildId}`, data, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    params: { noReplace: 'false' },
  });
};

export const deletePlayer = async (sessionId: string, guildId: string) => {
  return _request(
    `/sessions/${sessionId}/players/${guildId}`,
    {},
    {
      method: 'DELETE',
    },
  );
};

export const createLavalinkListener = (userId: Snowflake) => {
  const lavalinkEmitter = new EventEmitter();

  const lavalinkWs = new WebSocket(
    `${process.env.LAVA_WS_PROTOCOL}://${process.env.LAVA_URL}/${process.env.LAVA_VERS}/websocket`,
    {
      headers: {
        Authorization: process.env.LAVA_AUTH,
        'User-Id': userId,
        'Client-Name': `${process.env.BOT_NAME}/${process.env.BOT_VERSION}`,
      },
    },
  );

  lavalinkWs.on('message', (rawPayload) => {
    let json;

    try {
      json = JSON.parse(rawPayload as unknown as string);
    } catch (e) {
      console.error('Unable to parse lavalink websocket message');
    }

    const { op, ...payload } = json;

    if (!op) {
      console.error('Wrong websocket message format received from lavalink');
      return;
    }

    lavalinkEmitter.emit(op, payload);
  });

  return lavalinkEmitter;
};
