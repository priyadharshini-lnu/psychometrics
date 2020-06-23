import { connect } from 'react-redux'
import { closeModal } from 'modules/admin/core/temp/modals'
import {
  update, save, SAVE,
} from 'modules/admin/modules/threeSixtyCampaign/core/users'
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
