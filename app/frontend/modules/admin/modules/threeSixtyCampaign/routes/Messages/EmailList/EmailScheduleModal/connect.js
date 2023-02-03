import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from '~/modules/admin/core/ui/modals'
import {
  fetchSingle,
  fetchSchedulableTemplate,
  create,
  update,
  updateField,
  changeSelected,
  get as getEmailSchedules,
} from '~/modules/admin/modules/threeSixtyCampaign/core/emailSchedules'

export default connect(
  state => ({
    current: getCurrent(state),
    emailSchedules: getEmailSchedules(state),
    data: getData(state).EmailScheduleModal,
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
