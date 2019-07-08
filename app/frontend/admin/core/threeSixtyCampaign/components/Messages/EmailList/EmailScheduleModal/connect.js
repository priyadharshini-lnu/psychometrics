import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  fetchSchedulableTemplate,
  create,
  update,
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
    fetchSchedulableTemplate,
    create,
    update,
    changeSelected,
    closeModal,
  },
)
