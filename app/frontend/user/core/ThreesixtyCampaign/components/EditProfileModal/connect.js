import { connect } from 'react-redux'
import {
  sync,
  get as getUser,
} from 'user/core/temp/currentUser'

export default connect(
  state => ({ user: getUser(state) }),
  { sync },
)
