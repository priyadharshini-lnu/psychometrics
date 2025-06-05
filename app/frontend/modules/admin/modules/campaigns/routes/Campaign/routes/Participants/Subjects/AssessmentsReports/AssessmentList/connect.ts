import { connect, ConnectedProps } from 'react-redux'
import {
  get as getAssessments, rescoreResponse, reset, remove, resetProgress,
  toggleRequireScheduling, togglePrework, updateMettlSchedule, normalizeFactorScores,
  updateContentVariation, UPDATE_CONTENT_VARIATION, UPDATE_METTL_SCHEDULE,
} from '~/modules/admin/modules/campaigns/core/userAssessments'
import { openModal } from '~/modules/admin/core/ui/modals'
import { RootState } from '~/modules/admin/core/rootReducers'
import { isRequestInProgress } from '~/core/request'

const connecter = connect(
  (state: RootState) => ({
    assessments: getAssessments(state),
    currentUser: state.currentUser,
    loadingUpdateContentVariation: isRequestInProgress(state, UPDATE_METTL_SCHEDULE),
    loadingUpdateMettlSchedule: isRequestInProgress(state, UPDATE_CONTENT_VARIATION),
  }),
  {
    openModal,
    rescoreResponse,
    reset,
    remove,
    resetProgress,
    toggleRequireScheduling,
    togglePrework,
    updateMettlSchedule,
    normalizeFactorScores,
    updateContentVariation,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
