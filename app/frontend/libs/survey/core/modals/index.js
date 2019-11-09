import { setIn } from 'utils/immutable'
import LogicElement from 'models/logic/LogicElement'

const OPEN = 'survey/modals/OPEN'
const CLOSE = 'survey/modals/CLOSE'

export const open = (name, question) => ({ type: OPEN, name, question })
export const close = name => ({ type: CLOSE, name })

export const defaultState = {
  displayLogic: {
    show: false,
    question: null,
  },
}

const HANDLERS = {
  [OPEN]: (state, { name, question }) => setIn(
    state, [name], { show: true, question, logicElement: question.displayLogic || new LogicElement() },
  ),
  [CLOSE]: (state, { name }) => setIn(
    state, [name], { show: false, question: null, logicElement: null },
  ),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
