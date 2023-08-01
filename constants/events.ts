export enum LavalinkEvents {
  Ready = 'ready',
  PlayerUpdate = 'playerUpdate',
  Stats = 'stats',
  Event = 'event',
}

export enum LavalinkTrackEvents {
  TrackStartEvent = 'TrackStartEvent',
  TrackEndEvent = 'TrackEndEvent',
  TrackExceptionEvent = 'TrackExceptionEvent',
  TrackStuckEvent = 'TrackStuckEvent',
  WebSocketClosedEvent = 'WebSocketClosedEvent',
}
