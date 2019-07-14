import _ from 'lodash'
import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  add as addNominationRequirement,
  fetch as fetchNominationRequirements,
  syncWithServer,
} from 'admin/core/threeSixtyCampaign/nominationRequirements/actions'

export default connect(({
  temp: { modals: { current } },
  project: { relationships },
  threeSixtyCampaign: { nominationRequirements: { list } },
}) => ({
  current,
  nominationRequirements: list,
  defaultSelectedRelationship: _.get(relationships, [0, 'id']),
}),
{
  closeModal,
  addNominationRequirement,
  syncWithServer,
  fetchNominationRequirements,
})
