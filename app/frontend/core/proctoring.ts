import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProctoringState {
  isProctored: boolean
  proctoringCheckInProgress: boolean
  proctoringMethod: 'iframe' | 'userAgent' | 'message' | null
}

const getInitialProctoringState = (): ProctoringState => {
  const isInIframe = window.top !== window
  const isExamusElectron = window.navigator.userAgent.includes('examus-electron')

  if (isExamusElectron) {
    return {
      isProctored: true,
      proctoringCheckInProgress: false,
      proctoringMethod: 'userAgent',
    }
  }

  if (isInIframe) {
    return {
      isProctored: true,
      proctoringCheckInProgress: false,
      proctoringMethod: 'iframe',
    }
  }

  return {
    isProctored: false,
    proctoringCheckInProgress: true,
    proctoringMethod: null,
  }
}

const proctoringSlice = createSlice({
  name: 'proctoring',
  initialState: getInitialProctoringState(),
  reducers: {
    setProctoringState: (state, action: PayloadAction<Partial<ProctoringState>>) => ({ ...state, ...action.payload }),
  },
})

export const { setProctoringState } = proctoringSlice.actions

export type { ProctoringState }
export default proctoringSlice.reducer
