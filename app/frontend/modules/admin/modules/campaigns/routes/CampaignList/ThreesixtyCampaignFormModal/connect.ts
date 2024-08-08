import { connect, ConnectedProps } from 'react-redux'
import {
  addInReduxStore,
  fetchTemplatesAndAssessments,
} from '~/modules/admin/modules/campaigns/core/list/index'

const connecter = connect(
  () => ({
  }),
  {
    fetchTemplatesAndAssessments,
    addInReduxStore,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
