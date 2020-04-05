/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/reduxUtils'
import { updateIn, setIn } from 'utils/immutable'
import {
  INIT, ADD_PAGE,
} from '../actions'
import { ADD_MODULE, REMOVE_PAGE, RENAME_PAGE } from './actions'

export const defaultState = {}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    if (_.size(data.entities.pages) > 0) {
      return data.entities.pages
    }
    return state
  },
  [ADD_MODULE]: (state, { currentPage, module }) => updateIn(
    state, currentPage, page => ({ ...page, modules: [...page.modules, module.id] }),
  ),
  [ADD_PAGE]: (state, { page }) => setIn(state, page.id, page.toJSON()),
  [REMOVE_PAGE]: (state, { id }) => setIn(state, [id, 'removed'], true),
  [RENAME_PAGE]: (state, { id, name }) => setIn(state, [id, 'name'], name),
}

export default createReducer(HANDLERS, defaultState)
