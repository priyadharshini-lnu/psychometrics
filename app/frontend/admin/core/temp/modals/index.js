import { CREATE_ALL } from '../../threeSixtyCampaign/subjects'

const OPEN_MODAL = 'modals/OPEN_MODAL'
const CLOSE_MODAL = 'modals/CLOSE_MODAL'
export const defaultState = {
  current: null,
}

export const openModal = name => ({ type: OPEN_MODAL, name })
export const closeModal = () => ({ type: CLOSE_MODAL })

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return { ...state, current: action.name }
    case CREATE_ALL: // TODO (atanych): sort out with Fedor
    case CLOSE_MODAL:
      return { ...state, current: null }
    default:
      return state
  }
}
