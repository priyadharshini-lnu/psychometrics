/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import {
  INIT,
} from '../actions'

export const defaultState = {}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    if (_.size(data.entities.pages) > 0) {
      return data.entities.pages
    }
    return state
  },
}

export default createReducer(HANDLERS, defaultState)
