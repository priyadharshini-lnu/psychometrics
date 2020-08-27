import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments, rescoreResponse } from 'modules/admin/modules/campaigns/core/userAssessments'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    assessments: getAssessments(state),
  }),
  {
    openModal,
    rescoreResponse,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
