import { connect } from 'react-redux'
import { selectBlock } from '~/modules/survey/core/builder/assessment/selectors'
import { initFromBlock } from '~/modules/survey/core/builder/assessment/actions'
import { fetchBlockCenter } from '~/modules/survey/core/builder/blockCenter'

export default connect(
  ({ survey }) => ({
    loaded: survey.builder.assessment.loaded,
    disabled: survey.builder.assessment.disabled,
    block: selectBlock(survey.builder, survey.builder.assessment.id),
  }),
  {
    fetchBlockCenter,
    initFromBlock,
  },
)
