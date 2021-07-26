import { connect, ConnectedProps } from 'react-redux'
import { getSingle, updateNorm, UPDATE_NORM } from 'modules/admin/modules/campaigns/core/userAssessments'
import { isRequestInProgress } from 'modules/admin/core/request'
import { OwnProps } from './UpdateNormModal'

const connecter = connect(
  (state, props: OwnProps) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
    loading: isRequestInProgress(state, UPDATE_NORM),
  }),
  {
    updateNorm,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
