import { createReducer } from 'utils/reduxUtils'
import { RECORDER_STATES, UPLOAD_STATES, PLAYER_STATE } from './constants'

export interface State {
  file: Blob | null
  recordingState: string
  totalPausedTime: number
  lastPauseTime: number
  uploadState: string
  playerState: string
  audioPulse: number
  errorCodes: Array<string>
  percent: number
  recordingTime: number
}

export const initialState = {
  file: null,
  recordingState: RECORDER_STATES.INIT,
  totalPausedTime: 0,
  lastPauseTime: 0,
  uploadState: UPLOAD_STATES.READY,
  playerState: PLAYER_STATE.PAUSED,
  audioPulse: 0.7,
  errorCodes: [],
  percent: 0,
  recordingTime: 0,
}

export const SET_RECORDER_STATES = 'SET_RECORDER_STATES'
export const SET_UPLOAD_STATE = 'SET_UPLOAD_STATE'
export const SET_FILE = 'SET_FILE'
export const REMOVE_FILE = 'REMOVE_FILE'
export const SET_ERRORS = 'SET_ERROR_CODES'
export const SET_PERCENTAGE = 'SET_PERCENTAGE'
export const SET_AUDIO_PULSE = 'SET_AUDIO_PULSE'
export const SET_PLAYER_STATE = 'SET_PLAYER_STATE'
export const SET_RECORDING_TIME = 'SET_RECORDING_TIME'
export const REMOVE_RECORDING = 'REMOVE_RECORDING'

interface SetRecordStateAction { type: typeof SET_RECORDER_STATES, payload: { recordingState: string } }
interface SetUploadStateAction { type: typeof SET_UPLOAD_STATE, payload: { uploadState: string } }
interface SetFileAction { type: typeof SET_FILE, payload: { file: Blob } }
interface SetErrorsAction { type: typeof SET_ERRORS, payload: { errorCodes: Array<string> } }
interface SetPercentAction { type: typeof SET_PERCENTAGE, payload: { percent: number } }
interface UpdateAudioPulseAction { type: typeof SET_AUDIO_PULSE, payload: { audioPulse: number } }
interface SetPlayerStateAction { type: typeof SET_PLAYER_STATE, payload: { playerState: string } }
interface SetRecordingTime { type: typeof SET_RECORDING_TIME, payload: { recordingTime: number } }
interface RemoveFile { type: typeof REMOVE_FILE }
interface RemoveRecordingAction {
  type: typeof REMOVE_RECORDING
  request: { url: string, method: 'delete', body: { mediaId: number }}
}

export type Action = SetRecordStateAction | SetUploadStateAction | SetFileAction | SetErrorsAction |
  SetPercentAction | UpdateAudioPulseAction | SetPlayerStateAction | SetRecordingTime | RemoveFile

export const setRecordingState = (recordingState: string): SetRecordStateAction => ({
  type: SET_RECORDER_STATES,
  payload: { recordingState },
})

export const setUploadState = (uploadState: string): SetUploadStateAction => ({
  type: SET_UPLOAD_STATE,
  payload: { uploadState },
})

export const setFile = (file: Blob): SetFileAction => ({
  type: SET_FILE,
  payload: { file },
})

export const setAudioPulse = (audioPulse: number): UpdateAudioPulseAction => ({
  type: SET_AUDIO_PULSE,
  payload: { audioPulse },
})

export const setPlayerState = (playerState: string): SetPlayerStateAction => ({
  type: SET_PLAYER_STATE,
  payload: { playerState },
})

export const setRecordingTime = (recordingTime: number): SetRecordingTime => ({
  type: SET_RECORDING_TIME,
  payload: { recordingTime },
})

export const removeRecording = (url: string, mediaId: number): RemoveRecordingAction => ({
  type: REMOVE_RECORDING,
  request: {
    url,
    method: 'delete',
    body: { mediaId },
  },
})

export const removeFile = (): RemoveFile => ({ type: REMOVE_FILE })

const HANDLERS = {
  [SET_RECORDER_STATES]: (state: State, { payload: { recordingState } }: SetRecordStateAction): State => (
    { ...state, recordingState }),
  [SET_UPLOAD_STATE]: (state: State, { payload: { uploadState } }: SetUploadStateAction): State => (
    { ...state, uploadState }),
  [SET_FILE]: (state: State, { payload: { file } }: SetFileAction): State => ({ ...state, file }),
  [REMOVE_FILE]: (state: State): State => ({
    ...state,
    file: null,
    recordingState: RECORDER_STATES.READY,
    uploadState: UPLOAD_STATES.READY,
    playerState: PLAYER_STATE.PAUSED,
    errorCodes: [],
  }),
  [SET_ERRORS]: (state: State, { payload: { errorCodes } }: SetErrorsAction): State => (
    { ...state, errorCodes, recordingState: UPLOAD_STATES.ERROR }),
  [SET_PERCENTAGE]: (state: State, { payload: { percent } }: SetPercentAction): State => ({ ...state, percent }),
  [SET_AUDIO_PULSE]: (state: State, { payload: { audioPulse } }: UpdateAudioPulseAction): State => (
    { ...state, audioPulse }),
  [SET_PLAYER_STATE]: (state: State, { payload: { playerState } }: SetPlayerStateAction): State => (
    { ...state, playerState }),
  [SET_RECORDING_TIME]: (state: State, { payload: { recordingTime } }: SetRecordingTime): State => (
    { ...state, recordingTime }),
}


const reducer: (state: State, action: Action) => State = createReducer(HANDLERS, {})

export default reducer
