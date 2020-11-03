import { connect, ConnectedProps } from 'react-redux'
import { updateAssessment, attachAssessmentToGroup } from 'modules/admin/modules/campaigns/core/assessmentGroups'

const connecter = connect(
  () => ({}),
  {
    updateAssessment,
    attachAssessmentToGroup,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
