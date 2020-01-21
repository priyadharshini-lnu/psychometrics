import { createReducer } from 'utils/reduxUtils'

export const SELECT = 'survey/temp/hotSpot/SELECT'

export const select = shapeIndex => ({ type: SELECT, shapeIndex })

export const defaultState = {
  shapeIndex: null,
}

const HANDLERS = {
  [SELECT]: (store, { shapeIndex }) => ({ shapeIndex }),
}

export default createReducer(HANDLERS, defaultState)
