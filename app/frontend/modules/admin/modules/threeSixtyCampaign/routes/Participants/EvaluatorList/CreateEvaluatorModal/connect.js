import { connect } from 'react-redux'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import {
  fillEvaluators,
  createAllEvaluators, clearForm, CREATE_ALL_EVALUATORS, getForm,
} from '~/modules/admin/modules/threeSixtyCampaign/core/evaluators'
import { isRequestInProgress } from '~/core/request'
import { getRelationships } from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'
import { get as getAutocomplete } from '~/modules/admin/core/ui/autocomplete'

export default connect(
  (state) => {
    const autocomplete = getAutocomplete(state)
    const form = getForm(state)

    return {
      errors: form.errors,
      current: getCurrent(state),
      autocompletedSubjects: autocomplete.subjects || [],
      autocompletedEvaluators: autocomplete.evaluators || [],
      evaluators: form.attrs,
      relationships: getRelationships(state),
      creationInProgress: isRequestInProgress(state, CREATE_ALL_EVALUATORS),
    }
  },
  {
    closeModal,
    createAllEvaluators,
    fillEvaluators,
    clearForm,
  },
)
