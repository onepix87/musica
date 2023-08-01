export const NotInVoiceChannelWarn = {
  ru: 'Для начала нужно зайти в голосовой канал!',
  default: 'You should join voice channel first',
} as const;

export const NetworkError = {
  ru: 'Произошла ошибка подключения. Пожалуйста, попробуйте позже',
  default: 'Network error occurred. Please try again later',
} as const;

export const UnknownError = {
  ru: 'Что-то пошло не так. Пожалуйста, попробуйте еще раз',
  default: 'Something went wrong. Please try again',
} as const;

export const NotFoundError = {
  ru: 'По этому запросу ничего не найдено',
  default: 'Results not found',
};

export const PlayDescription = {
  default: 'Searches and plays a track using the query',
  ru: 'Ищет и проигрывает трек по запросу',
} as const;

export const PlayQueryDescription = {
  default: 'Query to search for',
  ru: 'Запрос для поиска',
} as const;

export const PlayResponse = {
  default: 'Now playing',
  ru: 'Сейчас играет:',
} as const;

export const TrackLoadFailed = {
  default: 'Failed to load track',
  ru: 'Не получается загрузить трек',
} as const;

export const TrackException = {
  default: 'Failed to play this track',
  ru: 'Не получается проиграть этот трек',
} as const;

export const LeaveDescription = {
  default: 'Leaves voice channel',
  ru: 'Покинуть голосовой канал',
} as const;

export const LeaveResponse = {
  default: 'Bye-bye!',
  ru: 'Пока-пока!',
} as const;

export const TrackAddedToQueue = {
  default: 'queued',
  ru: 'добавлен в очередь',
} as const;

export const SkipDescription = {
  default: 'Skips current track',
  ru: 'Пропускает текущую песню',
} as const;

export const SkipNoTrackResponse = {
  default: 'There is no track playing that could be skipped',
  ru: 'Нет трека, который можно было бы пропустить',
};

export const SkipResponse = {
  default: 'Skipping',
  ru: 'Пропускаю',
} as const;

export const PauseDescription = {
  default: 'Pauses current track',
  ru: 'Ставит текущий трек на паузу',
} as const;

export const PauseResponse = {
  default: 'Pausing',
  ru: 'Ставлю на паузу',
} as const;

export const PauseNoTrackResponse = {
  default: 'There is no track playing that could be paused',
  ru: 'Нет трека, который можно было бы остановить',
} as const;

export const StopDescription = {
  default: 'Clears current queue',
  ru: 'Очищает текущую очередь треков',
} as const;

export const StopResponse = {
  default: 'Current queue has been cleared!',
  ru: 'Текущая очередь очищена!',
} as const;

export const UnpauseDescription = {
  default: 'Unpauses current track',
  ru: 'Снимает текущий трек с паузы',
} as const;

export const UnpauseNoTrackResponse = {
  default: 'There is no paused track',
  ru: 'Нет трека, который бы стоял на паузе',
} as const;

export const UnpauseResponse = {
  default: 'Unpausing',
  ru: 'Снимаю с паузы',
} as const;
