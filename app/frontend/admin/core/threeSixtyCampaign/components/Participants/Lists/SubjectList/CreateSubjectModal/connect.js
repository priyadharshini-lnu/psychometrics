import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { search } from 'admin/core/temp/autocomplete'
import {
  createAll, fillSubjects, clearForm, CREATE_ALL,
} from 'admin/core/threeSixtyCampaign/subjects'

export default connect(
  ({
    threeSixtyCampaign: {
      subjects: {
        form: { attrs, errors },
      },
    },
    temp: {
      modals: { current },
      autocomplete: { users = [] },
      request: { loading, name: requestName },
    },
  }) => ({
    errors,
    current,
    autocompletedUsers: users,
    subjects: attrs,
    creationInProgress: loading && requestName === CREATE_ALL,
  }),
  {
    closeModal,
    search,
    createAll,
    fillSubjects,
    clearForm,
  },
)
