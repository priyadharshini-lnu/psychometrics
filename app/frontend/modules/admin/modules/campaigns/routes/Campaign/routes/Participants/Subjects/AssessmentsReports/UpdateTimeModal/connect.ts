import { connect, ConnectedProps } from 'react-redux'
import { getSingle, updateAdditionalTime } from '~/modules/admin/modules/campaigns/core/userAssessments'
import { OwnProps } from './UpdateTimeModal'

const connecter = connect(
  (state, props: OwnProps) => ({
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    updateAdditionalTime,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
