import ModuleInterface from '../../interfaces/Module'

export const UPDATE_MODULE = 'report/module/UPDATE_MODULE'
export const REMOVE_MODULE = 'report/page/REMOVE_MODULE'

export const removeModule = (id: number) => ({
  type: REMOVE_MODULE, id,
})

export const updateModule = (module: ModuleInterface) => ({ type: UPDATE_MODULE, module })


export type UpdateModuleType = ReturnType<typeof updateModule>
export type RemoveModuleType = ReturnType<typeof removeModule>
