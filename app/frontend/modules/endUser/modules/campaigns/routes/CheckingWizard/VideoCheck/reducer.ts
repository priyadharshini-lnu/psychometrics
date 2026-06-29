import { createReducer } from '~/utils/redux'
import { CheckListStatus } from '../interfaces'

export interface State {
  systemCheck: CheckListStatus
  access: CheckListStatus
  faceDetection: CheckListStatus
  ambientLight: CheckListStatus
  speechDetection: CheckListStatus
  speechTestText:string
  uploading: CheckListStatus
  speechVerification: CheckListStatus
}

export const initialState: State = {
  systemCheck: CheckListStatus.InProgress,
  access: CheckListStatus.InProgress,
  faceDetection: CheckListStatus.InProgress,
  speechDetection: CheckListStatus.InProgress,
  speechTestText: '',
  uploading: CheckListStatus.Pending,
  ambientLight: CheckListStatus.InProgress,
  speechVerification: CheckListStatus.Pending,
}

export const UPDATE_SYSTEM_CHECK = 'UPDATE_SYSTEM_CHECK'
export const UPDATE_ACCESS = 'UPDATE_ACCESS'
export const UPDATE_FACE_DETECTION = 'UPDATE_FACE_DETECTION'
export const UPDATE_SPEECH_DETECTION = 'UPDATE_SPEECH_DETECTION'
export const UPDATE_SPEECH_TEST_TEXT = 'UPDATE_SPEECH_TEST_TEXT'
export const UPDATE_UPLOADING = 'UPDATE_UPLOADING'
export const FACE_DETECTION_FAILED_BY_TIMEOUT = 'FACE_DETECTION_FAILED_BY_TIMEOUT'
export const UPDATE_AMBIENT_LIGHT = 'UPDATE_AMBIENT_LIGHT'
export const UPDATE_SPEECH_VERIFICATION = 'UPDATE_SPEECH_VERIFICATION'


export const updateSystemCheck = (status: CheckListStatus) => ({
  type: UPDATE_SYSTEM_CHECK as typeof UPDATE_SYSTEM_CHECK,
  payload: { status },
})

export const updateAccess = (status: CheckListStatus) => ({
  type: UPDATE_ACCESS as typeof UPDATE_ACCESS,
  payload: { status },
})


export const updateFaceDetection = (status: CheckListStatus) => ({
  type: UPDATE_FACE_DETECTION as typeof UPDATE_FACE_DETECTION,
  payload: { status },
})

export const updateSpeechDetection = (status: CheckListStatus) => ({
  type: UPDATE_SPEECH_DETECTION as typeof UPDATE_SPEECH_DETECTION,
  payload: { status },
})

export const updateSpeechTestText = (text: string) => ({
  type: UPDATE_SPEECH_TEST_TEXT as typeof UPDATE_SPEECH_TEST_TEXT,
  payload: { text },
})

export const updateUploading = (status: CheckListStatus) => ({
  type: UPDATE_UPLOADING as typeof UPDATE_UPLOADING,
  payload: { status },
})

export const updateSpeechVerification = (status: CheckListStatus) => ({
  type: UPDATE_SPEECH_VERIFICATION as typeof UPDATE_SPEECH_VERIFICATION,
  payload: { status },
})

export const failFaceDetectionByTimeout = () => ({
  type: FACE_DETECTION_FAILED_BY_TIMEOUT as typeof FACE_DETECTION_FAILED_BY_TIMEOUT,
})

type updateSystemCheck = ReturnType<typeof updateSystemCheck>
type UpdateAccessType = ReturnType<typeof updateAccess>
type UpdateFaceDetectionType = ReturnType<typeof updateFaceDetection>
type UpdateSpeechDetectionAction = ReturnType<typeof updateSpeechDetection>
type UpdateSpeechTestText = ReturnType<typeof updateSpeechTestText>
type UpdateSpeechVerificationType = ReturnType<typeof updateSpeechVerification>


const HANDLERS = {
  [UPDATE_SYSTEM_CHECK]: (state: State, { payload: { status } }: updateSystemCheck):
  State => ({ ...state, systemCheck: status }),
  [UPDATE_ACCESS]: (state: State, { payload: { status } }: UpdateAccessType): State => ({ ...state, access: status }),
  [UPDATE_FACE_DETECTION]: (state: State, { payload: { status } }: UpdateFaceDetectionType): State => ({
    ...state,
    faceDetection: status,
  }),
  [UPDATE_SPEECH_DETECTION]: (state: State, { payload: { status } }: UpdateSpeechDetectionAction): State => ({
    ...state,
    speechDetection: status,
  }),
  [UPDATE_SPEECH_TEST_TEXT]: (state: State, { payload: { text } }: UpdateSpeechTestText): State => ({
    ...state,
    speechTestText: text,
  }),
  [UPDATE_UPLOADING]: (state: State, { payload: { status } }: UpdateFaceDetectionType): State => ({
    ...state,
    uploading: status,
  }),
  [FACE_DETECTION_FAILED_BY_TIMEOUT]: (state: State): State => {
    if (state.faceDetection === CheckListStatus.InProgress) return { ...state, faceDetection: CheckListStatus.Failed }
    return state
  },
  [UPDATE_AMBIENT_LIGHT]: (state: State, { payload: { status } }: UpdateAccessType): State => ({
    ...state,
    ambientLight: status,
  }),
  [UPDATE_SPEECH_VERIFICATION]: (state: State, { payload: { status } }: UpdateSpeechVerificationType): State => ({
    ...state,
    speechVerification: status,
  }),
}

export default createReducer(HANDLERS, initialState)
