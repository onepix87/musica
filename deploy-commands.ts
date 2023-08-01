import dotenv from 'dotenv';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
  RESTPutAPIApplicationCommandsResult,
} from 'discord.js';
import * as Interactions from './interactions';
import { InteractionsImport } from './types';

dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? '');

const interactionsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

for (const name in Interactions) {
  const interaction = (Interactions as InteractionsImport)[name];
  if (!!interaction.data && !!interaction.execute) interactionsJSON.push(interaction.data);
  else console.warn(`Interaction ${name} is missing a required "data" or "execute" export.`);
}

(async () => {
  try {
    console.log(`Started refreshing ${interactionsJSON.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(process.env.APP_ID ?? ''), { body: interactionsJSON });

    console.log(
      `Successfully reloaded ${(data as RESTPutAPIApplicationCommandsResult).length} application (/) commands.`,
    );
  } catch (e) {
    console.error(e);
  }
})();
