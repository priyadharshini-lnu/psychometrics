import _ from 'lodash'

const OPEN_MODAL = 'modals/OPEN_MODAL'
const CLOSE_MODAL = 'modals/CLOSE_MODAL'
export const defaultState = {
  current: null,
  data: {},
}

export const getCurrent = state => _.get(state, ['temp', 'modals', 'current'])

export const openModal = (name, data) => ({ type: OPEN_MODAL, name, data })
export const closeModal = () => ({ type: CLOSE_MODAL })

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return { ...state, current: action.name, data: action.data || {} }
    case CLOSE_MODAL:
      return { ...state, current: null }
    default:
      return state
  }
}
