import lodashGet from 'lodash/get'

import { createReducer } from 'utils/redux'
import { ParentResourceType } from 'modules/admin/modules/DatasheetManagement/core/current'
import { RootState } from 'modules/admin/core/rootReducers'
import { Action } from 'redux'
import { FETCH, FetchAction, Column } from './list'

export type State = Column[]

export const get = (state: RootState): State => lodashGet(state, ['datasheet', 'columnDefinitions'])
export const getVisibleColumnNames = (state: RootState) => (
  get(state).filter(column => column.visible).map(column => column.id)
)

export const SET_VISIBLE_COLUMNS = 'datasheetManagement/SET_VISIBLE_COLUMNS'
export const SET_VISIBLE_COLUMNS_REQUEST = 'datasheetManagement/SET_VISIBLE_COLUMNS_REQUEST'

export const setVisibleColumns = (
  parentType: ParentResourceType,
  parentId: number,
  visibleColumns: string[],
) => ({
  type: SET_VISIBLE_COLUMNS,
  visibleColumns,
  request: {
    method: 'put',
    body: { visibleColumns },
    url: `/administration/${parentType}s/${parentId}/datasheet_rows/save_column_preference`,
  },
})

interface SaveColumnPreferenceAction extends Action {
  visibleColumns: string[]
}

const HANDLERS = {
  [FETCH]: (_: State, { response }: FetchAction) => response.columns,
  [SET_VISIBLE_COLUMNS_REQUEST]: (state: State, { visibleColumns }: SaveColumnPreferenceAction) => (
    state.map((column) => {
      const visible = visibleColumns.includes(column.id)
      return { ...column, visible }
    })
  ),
}

const defaultState: State = []

export default createReducer(HANDLERS, defaultState)
