import { INIT } from './types'

export default {
  [INIT]: (_, { data }) => data.flow,
}
