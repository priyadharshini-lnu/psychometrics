import { createReducer } from '~/utils/redux'
import { CheckListStatus } from '../interfaces'

interface State {
  access: CheckListStatus
  faceDetection: CheckListStatus
  ambientLight: CheckListStatus
  uploading: CheckListStatus
}

export const initialState: State = {
  access: CheckListStatus.InProgress,
  faceDetection: CheckListStatus.InProgress,
  uploading: CheckListStatus.Pending,
  ambientLight: CheckListStatus.InProgress,
}

export const UPDATE_ACCESS = 'UPDATE_ACCESS'
export const UPDATE_FACE_DETECTION = 'UPDATE_FACE_DETECTION'
export const UPDATE_UPLOADING = 'UPDATE_UPLOADING'
export const FACE_DETECTION_FAILED_BY_TIMEOUT = 'FACE_DETECTION_FAILED_BY_TIMEOUT'
export const UPDATE_AMBIENT_LIGHT = 'UPDATE_AMBIENT_LIGHT'


export const updateAccess = (status: CheckListStatus) => ({
  type: UPDATE_ACCESS as typeof UPDATE_ACCESS,
  payload: { status },
})


export const updateFaceDetection = (status: CheckListStatus) => ({
  type: UPDATE_FACE_DETECTION as typeof UPDATE_FACE_DETECTION,
  payload: { status },
})

export const updateUploading = (status: CheckListStatus) => ({
  type: UPDATE_UPLOADING as typeof UPDATE_UPLOADING,
  payload: { status },
})

export const failFaceDetectionByTimeout = () => ({
  type: FACE_DETECTION_FAILED_BY_TIMEOUT as typeof FACE_DETECTION_FAILED_BY_TIMEOUT,
})

type UpdateAccessType = ReturnType<typeof updateAccess>
type UpdateFaceDetectionType = ReturnType<typeof updateFaceDetection>

const HANDLERS = {
  [UPDATE_ACCESS]: (state: State, { payload: { status } }: UpdateAccessType): State => ({ ...state, access: status }),
  [UPDATE_FACE_DETECTION]: (state: State, { payload: { status } }: UpdateFaceDetectionType): State => ({
    ...state,
    faceDetection: status,
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
}

export default createReducer(HANDLERS, initialState)
