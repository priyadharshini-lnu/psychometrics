import { connect, ConnectedProps } from 'react-redux'
import {
  fetchResult,
} from 'modules/user/modules/campaigns/core/anonym'
import { RootState } from 'modules/user/core/rootReducers'


const connecter = connect(
  (state: RootState) => ({
    anonym: state.anonym,
  }),
  {
    fetchResult,
  },
)

export type PropsFromRedux = ConnectedProps<typeof connecter>

export default connecter
