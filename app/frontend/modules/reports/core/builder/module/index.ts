/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { setIn } from 'modules/reports/utils/immutable'
import { INIT, PASTE_PAGE, PASTE_MODULE } from '../actions'
import {
  UPDATE_MODULE, REMOVE_MODULE,
} from './actions'
import {
  ADD_MODULE,
} from '../page/actions'

export const defaultState = {}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    if (_.size(data.entities.modules) > 0) {
      return data.entities.modules
    }
    return state
  },
  [UPDATE_MODULE]: (state, { module }) => setIn(state, module.id, module),
  [ADD_MODULE]: (state, { module }) => setIn(state, module.id, module.toJSON()),
  [REMOVE_MODULE]: (state, { id }) => setIn(state, [id, 'removed'], true),
  [PASTE_PAGE]: (state, { modules }) => ({
    ...state,
    ...modules.reduce((acc, m) => {
      acc[m.id] = m.toJSON()
      return acc
    }, {}),
  }),
  [PASTE_MODULE]: (state, { module }) => setIn(state, module.id, module.toJSON()),
}

export default createReducer(HANDLERS, defaultState)
