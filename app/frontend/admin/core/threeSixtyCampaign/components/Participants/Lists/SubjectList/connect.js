import { connect } from 'react-redux'
import { fetchSubjects } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ threeSixtyCampaign: { subjects } }) => ({ subjects }),
  { fetchSubjects },
)
