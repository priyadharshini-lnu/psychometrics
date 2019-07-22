import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  fetchSchedulableTemplate,
  create,
  update,
  changeSelected,
} from 'admin/core/threeSixtyCampaign/emailSchedules'

import {
  fecthRecipientsByCriteria
} from 'admin/core/threeSixtyCampaign/emailSchedules/recipientCriteria'

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
    fecthRecipientsByCriteria,
    create,
    update,
    changeSelected,
    closeModal,
  },
)
