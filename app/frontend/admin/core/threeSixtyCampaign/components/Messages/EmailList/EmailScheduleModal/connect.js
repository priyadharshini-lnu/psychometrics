import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  fetchSingle,
  fetchSchedulableTemplate,
  create,
  update,
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
    create,
    update,
    updateField,
    changeSelected,
    closeModal,
  },
)
