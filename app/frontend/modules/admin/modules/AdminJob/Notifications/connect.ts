import { connect, ConnectedProps } from 'react-redux'
import {
  fetch, read, readAll, getAll, getUnread, getHasMore, create as createJob, update as updateJob,
} from '../core/adminJobs'

const connecter = connect(
  state => ({
    adminJobs: getAll(state),
    unread: getUnread(state),
    hasMore: getHasMore(state),
  }),
  {
    fetch,
    read,
    readAll,
    createJob,
    updateJob,
  },
)
export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
