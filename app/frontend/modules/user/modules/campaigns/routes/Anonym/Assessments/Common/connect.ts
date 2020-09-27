import { connect, ConnectedProps } from 'react-redux'
import { markAssessmentTimedOut } from 'core/preview/FlowProcessor/actions'
import { RootState } from 'modules/user/core/rootReducers'


const connecter = connect(
  (state: RootState) => ({
    preview: state.preview,
    anonym: state.anonym,
  }),
  {
    markAssessmentTimedOut,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
