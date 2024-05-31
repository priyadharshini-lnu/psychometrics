import { connect } from 'react-redux'
import { fillEvaluators } from '~/modules/admin/modules/threeSixtyCampaign/core/evaluators'
import {
  fetchRelationships, getManualRelationships,
} from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'

export default connect(
  (state) => {
    const autocomplete = getAutocomplete(state)

    return {
      autocompletedSubjects: autocomplete.subjects || [],
      autocompletedEvaluators: autocomplete.evaluators || [],
      relationships: getManualRelationships(state),
    }
  },
  {
    fillEvaluators,
    fetchRelationships,
  },
)
