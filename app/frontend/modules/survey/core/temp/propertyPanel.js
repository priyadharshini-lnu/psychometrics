import { createReducer } from '~/utils/redux'

export const SET_FIRST_BLOCK_CONTENT_OFFSET = 'survey/temp/propertyPanel/SET_FIRST_BLOCK_CONTENT_OFFSET'

export const setFirstBlockContentOffset = offset => ({
  type: SET_FIRST_BLOCK_CONTENT_OFFSET, offset,
})

export const defaultState = {
  firstBlockContentOffset: 0,
}

const HANDLERS = {
  [SET_FIRST_BLOCK_CONTENT_OFFSET]: (state, { offset }) => ({ firstBlockContentOffset: offset }),
}

export default createReducer(HANDLERS, defaultState)
