import { connect } from 'react-redux'
import { fillEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'
import { fetchRelationships, getManualRelationships } from 'admin/core/threeSixtyCampaign/relationships'

export default connect(
  ({
    project,
    temp: {
      autocomplete: { subjects = [], evaluators = [] },
    },
  }) => ({
    autocompletedSubjects: subjects,
    autocompletedEvaluators: evaluators,
    relationships: getManualRelationships({ project }),
  }),
  {
    fillEvaluators,
    fetchRelationships,
  },
)
