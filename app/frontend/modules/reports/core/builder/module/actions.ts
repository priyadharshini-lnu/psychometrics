import ModuleInterface from '../../interfaces/Module'

export const UPDATE_MODULE = 'report/module/UPDATE_MODULE'
export const REMOVE_MODULE = 'report/page/REMOVE_MODULE'
export const UPDATE_ALL = 'report/page/UPDATE_ALL'

export const removeModule = (id: number) => ({
  type: REMOVE_MODULE, id,
})

export const updateModule = (module: ModuleInterface) => ({ type: UPDATE_MODULE, module })
export const updateAll = (modules: ModuleInterface[]): UpdateAll => ({ type: UPDATE_ALL, modules })

interface UpdateAll { type: typeof UPDATE_ALL, modules: ModuleInterface[]}

export type UpdateModuleType = ReturnType<typeof updateModule>
export type RemoveModuleType = ReturnType<typeof removeModule>
export type UpdateAllType = ReturnType<typeof updateAll>
