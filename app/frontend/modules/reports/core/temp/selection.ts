import { createSlice } from '@reduxjs/toolkit'

interface State {
  pageId: number | null
  selected: number[]
}

export const defaultState: State = {
  pageId: null,
  selected: [],
}

const selection = createSlice({
  name: 'selection',
  initialState: defaultState,
  reducers: {
    toggle (state, { payload: { moduleId, pageId } }) {
      if (state.pageId && state.pageId !== pageId) {
        state.selected = [moduleId]
      } else if (state.selected.includes(moduleId)) {
        state.selected = state.selected.filter(item => item !== moduleId)
      } else {
        state.selected = [...state.selected, moduleId]
      }

      state.pageId = pageId
    },
    selectSignle (state, { payload: { moduleId, pageId } }) {
      state.selected = [moduleId]
      state.pageId = pageId
    },
    selectMultiple (state, { payload: { moduleIds, pageId } }) {
      state.selected = moduleIds
      state.pageId = pageId
    },
    addMultiple  (state, { payload: { moduleIds, pageId } }) {
      if (pageId === state.pageId) {
        state.selected = [...state.selected, ...moduleIds]
      } else {
        state.selected = moduleIds
      }
      state.pageId = pageId
    },
    unselectAll (state) {
      state.selected = []
      state.pageId = null
    },
  },
})

export const { actions } = selection

export default selection.reducer
