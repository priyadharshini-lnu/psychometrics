import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

import { fetchSubjects, update, remove } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({ threeSixtyCampaign: { subjects: { list } } }) => ({ subjects: list }),
  {
    fetchSubjects, openModal, update, remove,
  },
)
