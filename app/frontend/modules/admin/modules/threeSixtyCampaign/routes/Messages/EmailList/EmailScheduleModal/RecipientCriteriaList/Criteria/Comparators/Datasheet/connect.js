import { connect } from 'react-redux'
import { get as getDatasheetField } from '~/modules/admin/modules/threeSixtyCampaign/core/datasheetFields'

export default connect(
  state => ({ datasheetFields: getDatasheetField(state) }),
  null,
)
