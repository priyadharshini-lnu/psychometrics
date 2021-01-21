import { connect, ConnectedProps } from 'react-redux'
import { getSingle, updateNorm } from 'modules/admin/modules/campaigns/core/userAssessments'
import { OwnProps } from './UpdateNormModal'

const connecter = connect(
  (state, props: OwnProps) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    updateNorm,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
