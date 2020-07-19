import { connect } from 'react-redux'
import { search } from 'modules/admin/core/ui/autocomplete'
import { fillEvaluators } from 'modules/admin/modules/threeSixtyCampaign/core/evaluators'

export default connect(
  () => ({}),
  {
    search,
    fillEvaluators,
  },
)
