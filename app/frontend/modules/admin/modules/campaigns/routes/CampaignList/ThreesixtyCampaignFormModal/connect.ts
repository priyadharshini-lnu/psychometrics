import { connect, ConnectedProps } from 'react-redux'
import { getFeatures } from '~/core/config'
import { RootState } from '~/core/reducers'
import {
  addInReduxStore,
  fetchTemplatesAndAssessments,
} from '~/modules/admin/modules/campaigns/core/list/index'


const connecter = connect(
  (state: RootState) => ({
    features: getFeatures(state),
  }),
  {
    fetchTemplatesAndAssessments,
    addInReduxStore,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
