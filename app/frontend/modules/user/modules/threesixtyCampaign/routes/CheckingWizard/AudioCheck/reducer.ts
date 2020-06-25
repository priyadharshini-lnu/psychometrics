import { createReducer } from 'utils/redux'
import { CheckListStatus } from '../interfaces'

export interface State {
  access: CheckListStatus
  speechDetection: CheckListStatus
}

export const initialState: State = {
  access: CheckListStatus.InProgress,
  speechDetection: CheckListStatus.InProgress,
}

export const UPDATE_ACCESS = 'UPDATE_ACCESS'
export const UPDATE_SPEECH_DETECTION = 'UPDATE_SPEECH_DETECTION'

export const updateAccess = (status: CheckListStatus): AppActions => ({
  type: UPDATE_ACCESS,
  payload: { status },
})

export const updateSpeechDetection = (status: CheckListStatus): AppActions => ({
  type: UPDATE_SPEECH_DETECTION,
  payload: { status },
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

type AppActions = UpdateAccessAction | UpdateSpeechDetectionAction

const HANDLERS = {
  [UPDATE_ACCESS]: (state: State, { payload: { status } }: UpdateAccessAction): State => ({ ...state, access: status }),
  [UPDATE_SPEECH_DETECTION]: (state: State, { payload: { status } }: UpdateSpeechDetectionAction): State => ({
    ...state,
    speechDetection: status,
  }),
}

export default createReducer(HANDLERS, initialState)
