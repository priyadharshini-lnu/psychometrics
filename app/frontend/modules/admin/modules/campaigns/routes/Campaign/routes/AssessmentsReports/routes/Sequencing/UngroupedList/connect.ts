import { connect, ConnectedProps } from 'react-redux'
import { getUngroupedAssessments } from 'modules/admin/modules/campaigns/core/assessmentGroups'

const connecter = connect(
  state => ({
    assessments: getUngroupedAssessments(state),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
