import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { searchUsersInProject } from 'admin/core/temp/autocomplete'
import { createAll, fillSubjects } from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({
    threeSixtyCampaign: {
      subjects: {
        form: { attrs, errors },
      },
    },
    temp: {
      modals: { current },
      autocomplete: { users },
    },
  }) => ({
    errors, current, tempUsers: users, subjects: attrs,
  }),
  {
    closeModal,
    searchUsersInProject,
    createAll,
    fillSubjects,
  },
)
