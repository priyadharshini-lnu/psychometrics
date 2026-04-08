import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { updateIn, setIn } from '~/utils/immutable'
import {
  INIT, ADD_PAGE, SET_PAGE_POSITIONS, PASTE_PAGE, PASTE_MODULE,
  InitType, AddPageType, SetPagePositionType, PastePageType, PasteModuleType,
} from '../actions'
import {
  ADD_MODULE, REMOVE_PAGE, RENAME_PAGE, SAVE_DISPLAY_LOGIC, REMOVE_DISPLAY_LOGIC,
  AddModuleType, RemovePageType, RenamePageType, SaveDisplayLogicType, RemoveDisplayLogicType,
  UPDATE_ALL,
  UpdateAllType,
} from './actions'
import PageInterface from '../../interfaces/Page'

interface Store {
  [key: number]: PageInterface
}

export const defaultState: Store = {}

const HANDLERS = {
  [INIT]: (state: Store, { data }: InitType) => {
    if (_.size(data.entities.pages) > 0) {
      return data.entities.pages
    }
    return state
  },
  [ADD_MODULE]: (state: Store, { currentPage, module }: AddModuleType) => updateIn(
    state, currentPage, page => ({ ...page, modules: [...page.modules, module.id] }),
  ),
  [ADD_PAGE]: (state: Store, { page }: AddPageType) => setIn(state, page.id, page.toJSON()),
  [REMOVE_PAGE]: (state: Store, { id }: RemovePageType) => setIn(state, [id, 'removed'], true),
  [RENAME_PAGE]: (state: Store, { id, name }: RenamePageType) => setIn(state, [id, 'name'], name),
  [SET_PAGE_POSITIONS]: (state: Store, { order }: SetPagePositionType) => _.reduce(state, (pages, page) => ({
    ...pages, [page.id]: setIn(page, 'position', _.indexOf(order, page.id) + 1),
  }), {}),
  [PASTE_PAGE]: (state: Store, { pageId, modules }: PastePageType) => setIn(
    state, [pageId, 'modules'], _.map(modules, 'id'),
  ),
  [PASTE_MODULE]: (state: Store, { pageId, module }: PasteModuleType) => updateIn(
    state, [pageId, 'modules'], modules => [...modules, module.id],
  ),
  [SAVE_DISPLAY_LOGIC]: (state: Store, { id, displayLogic }: SaveDisplayLogicType) => setIn(
    state, [id, 'display_logic'], displayLogic,
  ),
  [REMOVE_DISPLAY_LOGIC]: (state: Store, { id }: RemoveDisplayLogicType) => setIn(state, [id, 'display_logic'], null),
  [UPDATE_ALL]: (state: Store, { pages }: UpdateAllType) => _.reduce(pages, (acc, page) => ({
    ...acc, [page.id]: page,
  }), {}),
}

export default createReducer(HANDLERS, defaultState)
