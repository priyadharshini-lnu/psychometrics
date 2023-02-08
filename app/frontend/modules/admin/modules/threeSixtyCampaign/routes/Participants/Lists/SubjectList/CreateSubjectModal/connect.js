import { connect } from 'react-redux'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import { search, get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'
import {
  createAll, fillSubjects, clearForm, CREATE_ALL, getForm,
} from '~/modules/admin/modules/threeSixtyCampaign/core/subjects'
import { isRequestInProgress } from '~/core/request'

export default connect(
  (state) => {
    const form = getForm(state)

    return {
      errors: form.errors,
      current: getCurrent(state),
      autocompletedUsers: getAutocomplete(state).users || [],
      subjects: form.attrs,
      creationInProgress: isRequestInProgress(state, CREATE_ALL),
    }
  },
  {
    closeModal,
    search,
    createAll,
    fillSubjects,
    clearForm,
  },
)
