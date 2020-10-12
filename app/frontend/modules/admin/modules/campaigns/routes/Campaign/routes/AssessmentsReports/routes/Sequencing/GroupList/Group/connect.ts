import { connect, ConnectedProps } from 'react-redux'
import { remove, update, getSortedAssessments } from 'modules/admin/modules/campaigns/core/assessmentGroups'
import { CampaignAssessmentGroup } from 'modules/admin/modules/campaigns/core/assessmentGroups/interfaces'
import { openModal } from 'modules/admin/core/ui/modals'

interface Props {
  group: CampaignAssessmentGroup
}

const connecter = connect(
  (state, props: Props) => ({
    assessments: getSortedAssessments(state, props.group.id),
  }),
  {
    remove,
    update,
    openModal,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
