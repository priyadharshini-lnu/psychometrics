import { connect } from 'react-redux'
import _ from 'lodash'
import {
  update as updateParticipantOptions,
  addDatasheetCriteriaWithDefaultValue,
  removeDatasheetCriteria,
  updateDatasheetCriteria,
  updateRelationship,
} from 'admin/core/threeSixtyCampaign/participantOptions/actions'
import { getSubjectOption, getRelationships } from 'admin/core/threeSixtyCampaign/participantOptions/selectors'
import { openModal } from 'admin/core/temp/modals'

export default connect(
  state => ({
    relationships: getRelationships(state),
    options: getSubjectOption(state),
  }),
  dispatch => ({
    updateRelationship: (...args) => dispatch(updateRelationship(...args)),
    updateParticipantOptions: _.curry((key, value) => dispatch(updateParticipantOptions(key, value))),
    removeDatasheetCriteria: _.curry((key, index) => dispatch(removeDatasheetCriteria(key, index))),
    updateDatasheetCriteria: _.curry(
      (key, index, name, value) => dispatch(updateDatasheetCriteria(key, index, name, value)),
    ),
    openNominationRequirementModal: () => dispatch(openModal('NominationRequirement')),
    addDatasheetCriteriaWithDefaultValue: key => dispatch(addDatasheetCriteriaWithDefaultValue(key)),
  }),
)
