import { connect, ConnectedProps } from 'react-redux'
import { get as getAssessments } from 'modules/admin/modules/campaigns/core/assessments'
import { activateUniversalLink, rescoreResponses } from 'modules/admin/modules/campaigns/core/assessments/actions'
import { openModal } from 'modules/admin/core/ui/modals'

const connecter = connect(
  state => ({
    assessments: getAssessments(state),
  }),
  {
    openModal,
    activateUniversalLink,
    rescoreResponses,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
