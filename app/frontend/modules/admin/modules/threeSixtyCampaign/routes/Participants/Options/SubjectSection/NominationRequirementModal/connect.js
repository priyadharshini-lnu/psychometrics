import _ from 'lodash'
import { connect } from 'react-redux'
import { closeModal, getCurrent } from '~/modules/admin/core/ui/modals'
import {
  add as addNominationRequirement,
  fetch as fetchNominationRequirements,
  syncWithServer,
} from '~/modules/admin/modules/threeSixtyCampaign/core/nominationRequirements/actions'
import {
  get as getNominationRequirements,
} from '~/modules/admin/modules/threeSixtyCampaign/core/nominationRequirements/selectors'
import { getRelationships } from '~/modules/admin/modules/threeSixtyCampaign/core/relationships'

export default connect((state) => {
  const relationships = getRelationships(state)

  return {
    current: getCurrent(state),
    nominationRequirements: getNominationRequirements(state).list,
    defaultSelectedRelationship: _.get(relationships, [0, 'id']),
  }
},
{
  closeModal,
  addNominationRequirement,
  syncWithServer,
  fetchNominationRequirements,
})
