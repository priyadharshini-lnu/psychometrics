import { connect, ConnectedProps } from 'react-redux'

import { RootState } from '~/modules/admin/core/rootReducers'

import { getSingle, updateNorm, UPDATE_NORM } from '~/modules/admin/modules/campaigns/core/userAssessments'
import { isRequestInProgress } from '~/core/request'
import { OwnProps } from './UpdateNormModal'

const connecter = connect(
  (state: RootState, props: OwnProps) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
    loading: isRequestInProgress(state, UPDATE_NORM),
  }),
  {
    updateNorm,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
