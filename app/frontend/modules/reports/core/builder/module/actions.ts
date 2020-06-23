import ModuleInterface from '../../interfaces/Module'

export const UPDATE_MODULE = 'report/module/UPDATE_MODULE'
export const REMOVE_MODULE = 'report/page/REMOVE_MODULE'

interface UpdateModule { type: typeof UPDATE_MODULE, module: ModuleInterface }
interface RemoveModule {
  type: typeof REMOVE_MODULE
  id: number
}

export const removeModule = (id: number): RemoveModule => ({
  type: REMOVE_MODULE, id,
})

export const updateModule = (module: ModuleInterface): UpdateModule => ({ type: UPDATE_MODULE, module })
