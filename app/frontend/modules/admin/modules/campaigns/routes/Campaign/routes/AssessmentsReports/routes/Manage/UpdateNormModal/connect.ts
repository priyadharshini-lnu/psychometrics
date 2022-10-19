import { connect, ConnectedProps } from 'react-redux'

import { RootState } from 'modules/admin/core/rootReducers'

import { updateNorm, UPDATE_NORM } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { isRequestInProgress } from 'core/request'
import { getSingle } from 'modules/admin/modules/campaigns/core/assessments'
import { OwnProps } from './UpdateNormModal'

const connecter = connect(
  (state: RootState, props: OwnProps) => ({
    loading: isRequestInProgress(state, UPDATE_NORM),
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    updateNorm,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
