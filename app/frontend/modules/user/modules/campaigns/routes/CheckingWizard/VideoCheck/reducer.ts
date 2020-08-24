import { createReducer } from 'utils/redux'
import { CheckListStatus } from '../interfaces'

interface State {
  access: CheckListStatus
  faceDetection: CheckListStatus
  ambientLight: CheckListStatus
}

export const initialState: State = {
  access: CheckListStatus.InProgress,
  faceDetection: CheckListStatus.InProgress,
  ambientLight: CheckListStatus.InProgress,
}

export const UPDATE_ACCESS = 'UPDATE_ACCESS'
export const UPDATE_FACE_DETECTION = 'UPDATE_FACE_DETECTION'
export const FACE_DETECTION_FAILED_BY_TIMEOUT = 'FACE_DETECTION_FAILED_BY_TIMEOUT'
export const UPDATE_AMBIENT_LIGHT = 'UPDATE_AMBIENT_LIGHT'

export const updateAccess = (status: CheckListStatus): AppActions => ({
  type: UPDATE_ACCESS,
  payload: { status },
})

export const updateFaceDetection = (status: CheckListStatus): AppActions => ({
  type: UPDATE_FACE_DETECTION,
  payload: { status },
})
export const failFaceDetectionByTimeout = (): AppActions => ({
  type: FACE_DETECTION_FAILED_BY_TIMEOUT,
})

interface UpdateAccessAction {
  type: typeof UPDATE_ACCESS
  payload: {
    status: CheckListStatus
  }
}

interface FailFaceDetectionByTimeout {
  type: typeof FACE_DETECTION_FAILED_BY_TIMEOUT
}
interface UpdateFaceDetectionAction {
  type: typeof UPDATE_FACE_DETECTION
  payload: {
    status: CheckListStatus
  }
}

type AppActions = UpdateAccessAction | UpdateFaceDetectionAction | FailFaceDetectionByTimeout

const HANDLERS = {
  [UPDATE_ACCESS]: (state: State, { payload: { status } }: UpdateAccessAction): State => ({ ...state, access: status }),
  [UPDATE_FACE_DETECTION]: (state: State, { payload: { status } }: UpdateFaceDetectionAction): State => ({
    ...state,
    faceDetection: status,
  }),
  [FACE_DETECTION_FAILED_BY_TIMEOUT]: (state: State): State => {
    if (state.faceDetection === CheckListStatus.InProgress) return { ...state, faceDetection: CheckListStatus.Failed }
    return state
  },
  [UPDATE_AMBIENT_LIGHT]: (state: State, { payload: { status } }: UpdateAccessAction): State => ({
    ...state,
    ambientLight: status,
  }),
}

export default createReducer(HANDLERS, initialState)
