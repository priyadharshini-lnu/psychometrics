import { setIn } from 'utils/immutable'
import { combineHandlers } from 'utils/reduxUtils'

const OPEN = 'survey/modals/OPEN'
const CLOSE = 'survey/modals/CLOSE'

export const open = (name, data) => ({ type: OPEN, name, data })
export const close = name => ({ type: CLOSE, name })

export const defaultState = {
  displayLogic: {
    show: false,
    question: null,
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

export default combineHandlers(HANDLERS, defaultStatus)
