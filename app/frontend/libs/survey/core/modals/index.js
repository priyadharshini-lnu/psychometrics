import { setIn } from 'utils/immutable'
import { createReducer } from 'utils/reduxUtils'

const OPEN = 'survey/modals/OPEN'
const CLOSE = 'survey/modals/CLOSE'

export const open = (name, data) => ({ type: OPEN, name, data })
export const close = name => ({ type: CLOSE, name })

export const defaultState = {
  displayLogic: {
    show: false,
    data: null,
  },
  defaultValue: {
    show: false,
    data: null,
  },
  randomization: {
    show: false,
    data: null,
  },
  preview: {
    show: false,
    data: null,
  },
  pipedText: {
    show: false,
    data: null,
  },
  richEditor: {
    show: false,
    data: null,
  },
  flow: {
    show: false,
    data: null,
  },
  customValidation: {
    show: false,
    data: null,
  },
  createByTemplate: {
    show: false,
    data: null,
  },
}

const HANDLERS = {
  [OPEN]: (state, { name, data }) => setIn(
    state, [name], { show: true, data },
  ),
  [CLOSE]: (state, { name }) => setIn(
    state, [name], { show: false, data: null },
  ),
}

export default createReducer(HANDLERS, defaultState)
