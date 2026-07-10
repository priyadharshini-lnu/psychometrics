import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/admin/core/rootReducers'
import {
  updateOccupationConditionSet,
  UPDATE_OCCUPATION_CONDITION_SET,
} from '~/modules/admin/modules/campaigns/core/assessments/actions'
import { getSingle } from '~/modules/admin/modules/campaigns/core/assessments'
import { isRequestInProgress } from '~/core/request'

type AssessmentIdProp = {
  campaignAssessmentId: number
}

const connecter = connect(
  (state: RootState, props: AssessmentIdProp) => ({
    loading: isRequestInProgress(state, UPDATE_OCCUPATION_CONDITION_SET),
    assessment: getSingle(state, props.campaignAssessmentId),
  }),
  {
    updateOccupationConditionSet,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
