import ModuleInterface from '../../interfaces/Module'

export const ADD_MODULE = 'report/page/ADD_MODULE'
export const REMOVE_PAGE = 'report/REMOVE_PAGE'
export const RENAME_PAGE = 'report/RENAME_PAGE'

interface AddModule {
  type: typeof ADD_MODULE
  currentPage: number
  module: ModuleInterface
}

interface RemovePage { type: typeof REMOVE_PAGE, id: number }
interface RenamePage { type: typeof RENAME_PAGE, id: number, name: string}

export const addModule = (currentPage: number, module: ModuleInterface): AddModule => ({
  type: ADD_MODULE, module, currentPage,
})


export const removePage = (id: number): RemovePage => ({ type: REMOVE_PAGE, id })
export const renamePage = (id: number, name: string): RenamePage => ({ type: RENAME_PAGE, id, name })
