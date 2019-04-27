import { connect } from 'react-redux'
import { fillEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  ({
    temp: {
      autocomplete: { subjects = [], evaluators = [] },
    },
  }) => ({
    autocompletedSubjects: subjects,
    autocompletedEvaluators: evaluators,
  }),
  {
    fillEvaluators,
  },
)
