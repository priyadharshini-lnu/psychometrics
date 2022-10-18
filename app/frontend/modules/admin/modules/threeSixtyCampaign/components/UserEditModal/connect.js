import { connect } from 'react-redux'
import { closeModal, getCurrent, getData } from 'modules/admin/core/ui/modals'
import {
  update, save, SAVE, getUserUnderEdit,
} from 'modules/admin/modules/threeSixtyCampaign/core/users'
import _ from 'lodash'
import { get as getCurrentUser } from 'core/currentUser'
import { isRequestInProgress } from 'core/request'

export default connect(
  state => ({
    current: getCurrent(state),
    saveInProgress: isRequestInProgress(state, SAVE),
    user: getUserUnderEdit(state),
    currentUser: getCurrentUser(state),
    onUserUpdate: _.get(getData(state), ['UserEditModal', 'onUserUpdate']),
  }),
  {
    closeModal,
    update,
    save,
  },
)
