import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  update, save, SAVE,
} from 'admin/core/threeSixtyCampaign/users'

export default connect(
  ({
    temp: {
      modals: { current },
      request: { loading, name: requestName },
      currentUser,
    },
    threeSixtyCampaign: { users: { userUnderEdit } },
  }) => ({
    current,
    saveInProgress: loading && requestName === SAVE,
    user: userUnderEdit,
    currentUser,
  }),
  {
    closeModal,
    update,
    save,
  },
)
