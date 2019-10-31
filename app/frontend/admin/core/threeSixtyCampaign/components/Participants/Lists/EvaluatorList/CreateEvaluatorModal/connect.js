import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  fillEvaluators,
  createAllEvaluators, clearForm, CREATE_ALL_EVALUATORS,
} from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  ({
    project: { relationships },
    threeSixtyCampaign: {
      evaluators: {
        form: { attrs, errors },
      },
    },
    temp: {
      modals: { current },
      autocomplete: { subjects = [], evaluators = [] },
      request: { loading, name: requestName },
    },
  }) => ({
    errors,
    current,
    autocompletedSubjects: subjects,
    autocompletedEvaluators: evaluators,
    evaluators: attrs,
    relationships,
    creationInProgress: loading && requestName === CREATE_ALL_EVALUATORS,
  }),
  {
    closeModal,
    createAllEvaluators,
    fillEvaluators,
    clearForm,
  },
)
