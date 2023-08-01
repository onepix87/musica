import {
  Client,
  ClientUser,
  GatewayDispatchEvents,
  GatewayVoiceServerUpdateDispatchData,
  GatewayVoiceStateUpdateData,
  GatewayVoiceStateUpdateDispatchData,
  Guild,
} from 'discord.js';
import { VoiceUpdateData } from '../types';

type GetServerUpdateOptions = GatewayVoiceStateUpdateData & {
  shardId: number;
};

export const sendVoiceUpdate = (
  client: Client,
  { shardId, self_deaf = false, self_mute = false, ...options }: GetServerUpdateOptions,
) => {
  client.ws.shards.get(shardId)?.send({ op: 4, d: { ...options, self_deaf, self_mute } });
};

export const getVoiceUpdateData = async (client: Client, guildId: Guild['id']) =>
  new Promise<VoiceUpdateData>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Discord did not respond in time.'));
    }, 5000);

    let returnData = {} as VoiceUpdateData;

    function serverUpdateCallback(update: GatewayVoiceServerUpdateDispatchData) {
      if (update.endpoint == null) reject(new Error('No endpoint was provided.'));
      returnData.token = update.token;
      returnData.endpoint = update.endpoint;

      client.ws.off(GatewayDispatchEvents.VoiceServerUpdate, serverUpdateCallback);

      if (returnData.session_id) {
        clearTimeout(timeout);
        resolve(returnData);
      }
    }

    function stateUpdateCallback(update: GatewayVoiceStateUpdateDispatchData) {
      if (update.user_id === (client.user as ClientUser).id && update.guild_id === guildId) {
        returnData.session_id = update.session_id;

        client.ws.off(GatewayDispatchEvents.VoiceStateUpdate, stateUpdateCallback);

        if (returnData.token && returnData.endpoint) {
          clearTimeout(timeout);
          resolve(returnData);
        }
      }
    }

    client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, serverUpdateCallback);
    client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, stateUpdateCallback);
  });
