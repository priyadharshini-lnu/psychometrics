import { connect } from 'react-redux'
import {
  sync,
  get as getUser,
} from 'core/currentUser'

export default connect(
  state => ({ user: getUser(state) }),
  { sync },
)
