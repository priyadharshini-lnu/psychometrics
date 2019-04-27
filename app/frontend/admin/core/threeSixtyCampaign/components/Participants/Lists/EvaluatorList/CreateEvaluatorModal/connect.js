import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import { fillEvaluators, createAllEvaluators } from 'admin/core/threeSixtyCampaign/evaluators'

export default connect(
  ({
    threeSixtyCampaign: {
      evaluators: {
        form: { attrs, errors },
      },
    },
    temp: {
      modals: { current },
      autocomplete: { subjects = [], evaluators = [] },
    },
  }) => ({
    errors,
    current,
    autocompletedSubjects: subjects,
    autocompletedEvaluators: evaluators,
    evaluators: attrs,
  }),
  {
    closeModal,
    createAllEvaluators,
    fillEvaluators,
  },
)
