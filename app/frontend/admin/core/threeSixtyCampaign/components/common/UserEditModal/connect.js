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
    },
  }) => ({
    current,
    saveInProgress: loading && requestName === SAVE,
    user: _.get(data, ['UserEditModal', 'user']),
  }),
  {
    closeModal,
    update,
    save,
  },
)
