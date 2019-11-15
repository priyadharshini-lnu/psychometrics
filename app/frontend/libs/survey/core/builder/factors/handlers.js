import { setIn } from 'utils/immutable'
import { INIT } from './types'

export default {
  [INIT]: (state, { data }) => setIn(state, ['factors'], data.factors),
}
