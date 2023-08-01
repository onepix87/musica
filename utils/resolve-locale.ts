import { Locale } from 'discord.js';

export const resolveLocale = (locale: Locale | string, localizedObj: Record<string, string>): string =>
  localizedObj[locale] ?? localizedObj['default'];
