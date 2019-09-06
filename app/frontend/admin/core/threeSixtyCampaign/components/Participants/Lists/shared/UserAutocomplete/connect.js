import { connect } from 'react-redux'
import { search } from 'admin/core/temp/autocomplete'
import { fillEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  () => ({}),
  {
    search,
    fillEvaluators,
  },
)
