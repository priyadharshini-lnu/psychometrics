import { connect } from 'react-redux'
import { fetchSubjects } from 'admin/core/threeSixtyCampaign/subjects'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  ({ threeSixtyCampaign: { subjects: { list } } }) => ({ subjects: list }),
  { fetchSubjects, openModal },
)
