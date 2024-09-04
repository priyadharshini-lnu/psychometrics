import { connect } from 'react-redux'
import { fetch as fetchReportFamilies } from '~/modules/admin/modules/campaigns/core/reportFamlies'

export default connect(
  () => ({
  }),
  {
    fetchReportFamilies,
  },
)
