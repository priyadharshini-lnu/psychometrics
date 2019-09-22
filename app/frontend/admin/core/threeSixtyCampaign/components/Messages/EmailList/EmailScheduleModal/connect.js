import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  fetchSingle,
  fetchSchedulableTemplate,
  create,
  updateField,
  changeSelected,
} from 'admin/core/threeSixtyCampaign/emailSchedules'

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
    save: create,
    updateField,
    changeSelected,
    closeModal,
  },
)
