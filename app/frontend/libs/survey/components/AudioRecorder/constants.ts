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

// Time in milesecond after which pulse sample would be checked to turn audio level from high to low
export const AUDIO_LEVEL_CHANGE_TO_LOW_THRESOLD = 500

// Pulse thresold which are considered high
export const HIGH_PULSE_THRESOLD = 0.80

// Percent of pulse which are sampled, that should be higher then this thresold to consider audio level to change
export const PERCENT_OF_HIGH_PULSE_THRESOLD = 80

const LOW = 'low'
const HIGH = 'high'
export const AUDIO_LEVEL = {
  LOW,
  HIGH,
}
