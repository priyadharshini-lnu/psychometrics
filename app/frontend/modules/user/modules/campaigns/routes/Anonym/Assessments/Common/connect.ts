import { connect, ConnectedProps } from 'react-redux'
import { markAssessmentTimedOut } from 'core/preview/FlowProcessor/actions'
import { RootState } from 'modules/user/core/rootReducers'
import { getProgress } from 'core/preview/FlowProcessor/selectors'


const connecter = connect(
  (state: RootState) => ({
    preview: state.preview,
    anonym: state.anonym,
    progress: getProgress(state.preview),
  }),
  {
    markAssessmentTimedOut,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
