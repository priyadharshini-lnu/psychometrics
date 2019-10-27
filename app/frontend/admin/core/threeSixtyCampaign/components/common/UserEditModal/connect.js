import { connect } from 'react-redux'
import { closeModal } from 'admin/core/temp/modals'
import {
  update, save, SAVE,
} from 'admin/core/threeSixtyCampaign/users'
import _ from 'lodash'

export default connect(
  ({
    temp: {
      modals: { current, data },
      request: { loading, name: requestName },
      currentUser,
    },
    threeSixtyCampaign: { users: { userUnderEdit } },
  }) => ({
    current,
    saveInProgress: loading && requestName === SAVE,
    user: userUnderEdit,
    currentUser,
    onUserUpdate: _.get(data, ['UserEditModal', 'onUserUpdate']),
  }),
  {
    closeModal,
    update,
    save,
  },
)
