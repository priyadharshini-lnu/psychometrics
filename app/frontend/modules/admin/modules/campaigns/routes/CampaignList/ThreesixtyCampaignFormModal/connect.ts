import { connect, ConnectedProps } from 'react-redux'
import { fetchTemplatesAndAssessments } from 'modules/admin/modules/campaigns/core/list/index'
import { fetchByAssessmentId } from 'modules/admin/modules/campaigns/core/factors'

const connecter = connect(
  () => ({
  }),
  {
    fetchTemplatesAndAssessments,
    fetchByAssessmentId,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
