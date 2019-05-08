import { connect } from 'react-redux'
import { fillEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { fetchRelationships } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  ({
    threeSixtyCampaign: { relationships },
    temp: {
      autocomplete: { subjects = [], evaluators = [] },
    },
  }) => ({
    autocompletedSubjects: subjects,
    autocompletedEvaluators: evaluators,
    relationships,
  }),
  {
    fillEvaluators,
    fetchRelationships,
  },
)
