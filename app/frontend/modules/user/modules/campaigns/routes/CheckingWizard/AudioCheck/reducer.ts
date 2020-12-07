import { DEPRECATED_createReducer } from 'utils/redux'
import { CheckListStatus } from '../interfaces'

export interface State {
  access: CheckListStatus
  speechDetection: CheckListStatus
  transcriptionMessage: string
}

export const initialState: State = {
  access: CheckListStatus.InProgress,
  speechDetection: CheckListStatus.InProgress,
  transcriptionMessage: '',
}

export const UPDATE_ACCESS = 'UPDATE_ACCESS'
export const UPDATE_SPEECH_DETECTION = 'UPDATE_SPEECH_DETECTION'
export const UPDATE_TRANSCRIPTION_MESSAGE = 'UPDATE_TRANSCRIPTION_MESSAGE'

export const updateAccess = (status: CheckListStatus): AppActions => ({
  type: UPDATE_ACCESS,
  payload: { status },
})

export const updateSpeechDetection = (status: CheckListStatus): AppActions => ({
  type: UPDATE_SPEECH_DETECTION,
  payload: { status },
})

export const updateTranscriptionMessage = (msg: string): AppActions => ({
  type: UPDATE_TRANSCRIPTION_MESSAGE,
  payload: { msg },
})

interface UpdateAccessAction {
  type: typeof UPDATE_ACCESS
  payload: {
    status: CheckListStatus
  }
}

interface UpdateSpeechDetectionAction {
  type: typeof UPDATE_SPEECH_DETECTION
  payload: {
    status: CheckListStatus
  }
}
interface UpdateTranscriptionMessageAction {
  type: typeof UPDATE_TRANSCRIPTION_MESSAGE
  payload: {
    msg: string
  }
}

type AppActions = UpdateAccessAction | UpdateSpeechDetectionAction | UpdateTranscriptionMessageAction

const HANDLERS = {
  [UPDATE_ACCESS]: (state: State, { payload: { status } }: UpdateAccessAction): State => ({ ...state, access: status }),
  [UPDATE_TRANSCRIPTION_MESSAGE]: (
    state: State,
    { payload: { msg } }: UpdateTranscriptionMessageAction,
  ): State => ({ ...state, transcriptionMessage: msg }),
  [UPDATE_SPEECH_DETECTION]: (state: State, { payload: { status } }: UpdateSpeechDetectionAction): State => ({
    ...state,
    speechDetection: status,
  }),
}

export default DEPRECATED_createReducer(HANDLERS, initialState)
