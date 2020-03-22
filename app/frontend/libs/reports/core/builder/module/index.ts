/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { updateIn, setIn } from 'utils/immutable'
import {
  INIT,
} from '../actions'

export const defaultState = {}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    if (_.size(data.entities.modules) > 0) {
      return data.entities.modules
    }
    return state
  },
}

export default createReducer(HANDLERS, defaultState)
