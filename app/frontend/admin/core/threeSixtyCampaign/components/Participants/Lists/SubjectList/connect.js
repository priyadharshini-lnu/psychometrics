import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

import { fetchSubjects, update, remove } from 'admin/core/threeSixtyCampaign/subjects'
import { removeUser } from 'admin/core/threeSixtyCampaign/'

export default connect(
  ({ threeSixtyCampaign: { subjects: { list } } }) => ({ subjects: list }),
  {
    fetchSubjects, openModal, update, remove, removeUser,
  },
)
