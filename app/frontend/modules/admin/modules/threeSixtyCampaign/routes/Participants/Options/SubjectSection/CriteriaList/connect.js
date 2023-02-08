import { connect } from 'react-redux'
import { get as getDatasheetFields } from '~/modules/admin/modules/threeSixtyCampaign/core/datasheetFields'

export default connect(
  state => ({ datasheetFields: getDatasheetFields(state) }),
  {},
)
