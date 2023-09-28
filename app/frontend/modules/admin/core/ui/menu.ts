import { createReducer } from '~/utils/redux'
import { RootState } from '~/modules/admin/core/rootReducers'

const ADD_SUBMENU = 'ui/menu/ADD_SUBMENU'
const REMOVE_SUBMENU = 'ui/menu/REMOVE_SUBMENU'
const OPEN_SUBMENU = 'ui/menu/OPEN_SUBMENU'
const CLOSE_SUBMENU = 'ui/menu/CLOSE_SUBMENU'
const COLLAPSE = 'ui/menu/COLLAPSE'

export const addSubmenu = () => ({ type: ADD_SUBMENU })
export const removeSubmenu = () => ({ type: REMOVE_SUBMENU })
export const openSubmenu = () => ({ type: OPEN_SUBMENU })
export const closeSubmenu = () => ({ type: CLOSE_SUBMENU })
export const triggerCollapse = () => ({ type: COLLAPSE })

export interface State {
  links: {[key: string]: string}
  hasSubmenu: boolean
  showSubmenu: boolean
  collapsed: boolean
}

export const defaultState: State = {
  links: {},
  hasSubmenu: false,
  showSubmenu: false,
  collapsed: false,
}

const HANDLERS = {
  [ADD_SUBMENU]: (state: State) => ({ ...state, hasSubmenu: true, showSubmenu: true }),
  [REMOVE_SUBMENU]: (state: State) => ({ ...state, hasSubmenu: false }),
  [OPEN_SUBMENU]: (state: State) => ({ ...state, showSubmenu: true }),
  [CLOSE_SUBMENU]: (state: State) => ({ ...state, showSubmenu: false }),
  [COLLAPSE]: (state: State) => ({ ...state, collapsed: !state.collapsed }),

}

export const getProject = (state: RootState) => state.ui.breadcrumbs.project

export default createReducer(HANDLERS, defaultState)
