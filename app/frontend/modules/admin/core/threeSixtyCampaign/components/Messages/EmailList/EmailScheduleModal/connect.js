import { connect } from 'react-redux'
import { closeModal } from 'modules/admin/core/temp/modals'
import {
  fetchSingle,
  fetchSchedulableTemplate,
  create,
  update,
  updateField,
  changeSelected,
} from 'modules/admin/core/threeSixtyCampaign/emailSchedules'

export default connect(
  ({
    temp: {
      modals: { current, data },
    },
    threeSixtyCampaign: { emailSchedules },
  }) => ({
    current,
    emailSchedules,
    data: data.EmailScheduleModal,
  }),
  {
    fetchSingle,
    fetchSchedulableTemplate,
    create,
    update,
    updateField,
    changeSelected,
    closeModal,
  },
)
