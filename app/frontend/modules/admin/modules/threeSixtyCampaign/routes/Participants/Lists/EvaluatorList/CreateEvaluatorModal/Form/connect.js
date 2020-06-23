import { connect } from 'react-redux'
import { fillEvaluators } from 'modules/admin/modules/threeSixtyCampaign/core/evaluators'
import { fetchRelationships, getManualRelationships } from 'modules/admin/modules/threeSixtyCampaign/core/relationships'

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
