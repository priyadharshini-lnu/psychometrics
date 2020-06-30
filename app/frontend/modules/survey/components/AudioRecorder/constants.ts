export const INIT = 'INIT'
export const READY = 'READY'
export const RECORDING = 'RECORDING'
export const PAUSED = 'PAUSED'
export const RECORDED = 'RECORDED'
export const SAVING = 'SAVING'
export const SAVED = 'SAVED'
export const ERROR = 'ERROR'
export const INACTIVE = 'INACTIVE'

export const RECORDER_STATES = {
  READY, RECORDING, PAUSED, RECORDED, SAVING, SAVED, ERROR, INACTIVE, INIT,
}

export const UPLOAD_STATES = {
  READY, SAVING, SAVED, ERROR,
}

export const PLAYING = 'PLAYING'
export const PLAYER_STATE = {
  PLAYING,
  PAUSED,
}

export const DEFAULT_MAX_DURATION = 10
