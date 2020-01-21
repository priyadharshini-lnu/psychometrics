import { connect } from 'react-redux'
import { blocksWithQuestions } from 'libs/survey/core/builder/assessment/selectors'
import {
  factorsSelector, selectedFactor, factorScoring, recodingSelector,
} from 'libs/survey/core/builder/factors/selectors'
import { } from 'libs/survey/core/builder/factors'

export default connect(
  ({ survey: { builder } }) => ({
    factors: factorsSelector(builder.factors, builder.assessment.factors),
    selectedFactor: selectedFactor(builder, builder.factors.current),
    blocks: blocksWithQuestions(builder, builder.assessment.blocks),
    scorings: factorScoring(builder, builder.factors.current),
    recoding: recodingSelector(builder),
  }),
  {
  },
)
