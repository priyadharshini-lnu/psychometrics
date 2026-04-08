import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'
import {
  INIT, PASTE_PAGE, PASTE_MODULE, PastePageType, PasteModuleType,
} from '../actions'
import {
  UPDATE_MODULE, REMOVE_MODULE, UPDATE_ALL,
  UpdateModuleType, RemoveModuleType, UpdateAllType,
} from './actions'
import {
  ADD_MODULE,
} from '../page/actions'
import ModuleInterface from '../../interfaces/Module'

export const defaultState: Store = {}

interface Store {
  [key: number]: ModuleInterface
}

type InitType = {
  type: typeof INIT,
  data: {entities: {modules: ModuleInterface[]}}
}

const HANDLERS = {
  [INIT]: (state, { data }: InitType) => {
    if (_.size(data.entities.modules) > 0) {
      return data.entities.modules
    }
    return state
  },
  [UPDATE_MODULE]: (state: Store, { module }: UpdateModuleType) => setIn(state, module.id, module),
  [ADD_MODULE]: (state: Store, { module }: UpdateModuleType) => setIn(state, module.id, module.toJSON()),
  [REMOVE_MODULE]: (state: Store, { id }: RemoveModuleType) => setIn(state, [id, 'removed'], true),
  [PASTE_PAGE]: (state: Store, { modules }: PastePageType) => ({
    ...state,
    ...modules.reduce((acc, m) => {
      acc[m.id] = m.toJSON()
      return acc
    }, {}),
  }),
  [PASTE_MODULE]: (state: Store, { module }: PasteModuleType) => setIn(state, module.id, module.toJSON()),
  [UPDATE_ALL]: (state: Store, { modules }: UpdateAllType) => _.reduce(modules, (acc, module) => ({
    ...acc, [module.id]: module,
  }), {}),
}

export default createReducer(HANDLERS, defaultState)
