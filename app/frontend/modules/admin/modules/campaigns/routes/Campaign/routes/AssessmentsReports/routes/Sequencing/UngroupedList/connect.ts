import { connect, ConnectedProps } from 'react-redux'
import { getSortedAssessments } from 'modules/admin/modules/campaigns/core/assessmentGroups'

const connecter = connect(
  state => ({
    assessments: getSortedAssessments(state, null),
  }),
  {
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
