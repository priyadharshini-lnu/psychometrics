import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'
import routeUtils from 'utils/routeUtils'

import {
  fetchSubjects, update, remove, downloadReport,
} from 'admin/core/threeSixtyCampaign/subjects'
import {
  edit as editUser,
} from 'admin/core/threeSixtyCampaign/users'

import { removeUser } from 'admin/core/threeSixtyCampaign/'

export default connect(
  ({
    threeSixtyCampaign: {
      subjects: { list, total },
    },
  }) => ({
    subjects: list, total, page: routeUtils.getPage(), searchTerm: routeUtils.getSearchTerm(),
  }),
  dispatch => ({
    fetchSubjects: (campaignId, page, query) => dispatch(fetchSubjects(campaignId, page, query)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    update: (campaignId, subjectId, data) => dispatch(update(campaignId, subjectId, data)),
    remove: (campaignId, subjectId, removeLicenceUsage) => dispatch(remove(campaignId, subjectId, removeLicenceUsage)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
    downloadReport: (campaignId, subjectId) => dispatch(downloadReport(campaignId, subjectId)),
    editUser: user => dispatch(editUser(user)),
  }),
)
