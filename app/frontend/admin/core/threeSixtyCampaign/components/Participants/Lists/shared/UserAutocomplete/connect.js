import { connect } from 'react-redux'
import { search } from 'modules/admin/core/ui/autocomplete'
import { fillEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  () => ({}),
  {
    search,
    fillEvaluators,
  },
)
