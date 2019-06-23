import { connect } from 'react-redux'
import { openModal } from 'admin/core/temp/modals'

import { fetchSubjects, update, remove, downloadReport } from 'admin/core/threeSixtyCampaign/subjects'
import { removeUser } from 'admin/core/threeSixtyCampaign/'

export default connect(
  ({ threeSixtyCampaign: { subjects: { list, total } } }) => ({ subjects: list, total }),
  dispatch => ({
    fetchSubjects: (campaignId, offset) => dispatch(fetchSubjects(campaignId, offset)),
    openModal: (name, data) => dispatch(openModal(name, data)),
    update: (campaignId, subjectId, data) => dispatch(update(campaignId, subjectId, data)),
    remove: (campaignId, subjectId) => dispatch(remove(campaignId, subjectId)),
    removeUser: (campaignId, userId) => dispatch(removeUser(campaignId, userId)),
    downloadReport: (campaignId, subjectId) => dispatch(downloadReport(campaignId, subjectId)),
  }),
)
