import _ from 'lodash'

const OPEN_MODAL = 'modals/OPEN_MODAL'
const CLOSE_MODAL = 'modals/CLOSE_MODAL'
export const defaultState = {
  current: [],
  data: {},
}

export const getCurrent = state => _.get(state, ['temp', 'modals', 'current'])
export const getData = state => _.get(state, ['temp', 'modals', 'data'])

export const openModal = (name, data) => ({ type: OPEN_MODAL, name, data })
export const closeModal = name => ({ type: CLOSE_MODAL, name })

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return {
        ...state,
        current: [...state.current, action.name],
        data: { ...state.data, [action.name]: action.data || {} },
      }
    case CLOSE_MODAL:
      return {
        ...state,
        current: action.name && _.isString(action.name) ? state.current.filter(c => c !== action.name) : [],
      }
    default:
      return state
  }
}
