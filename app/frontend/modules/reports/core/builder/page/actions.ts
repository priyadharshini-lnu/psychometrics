import ModuleInterface from '../../interfaces/Module'
import Page from '../../interfaces/Page'

export const ADD_MODULE = 'report/page/ADD_MODULE'
export const REMOVE_PAGE = 'report/REMOVE_PAGE'
export const RENAME_PAGE = 'report/RENAME_PAGE'
export const SAVE_DISPLAY_LOGIC = 'report/SAVE_DISPLAY_LOGIC'
export const REMOVE_DISPLAY_LOGIC = 'report/REMOVE_DISPLAY_LOGIC'
export const UPDATE_ALL = 'report/UPDATE_ALL'

interface RemovePage { type: typeof REMOVE_PAGE, id: number }
interface RenamePage { type: typeof RENAME_PAGE, id: number, name: string}

interface RemoveDisplayLogic { type: typeof REMOVE_DISPLAY_LOGIC, id: number}
interface UpdateAll { type: typeof UPDATE_ALL, pages: Page[]}

export const addModule = (currentPage: number, module: ModuleInterface) => ({
  type: ADD_MODULE, module, currentPage,
})


export const removePage = (id: number): RemovePage => ({ type: REMOVE_PAGE, id })
export const renamePage = (id: number, name: string): RenamePage => ({ type: RENAME_PAGE, id, name })

export const saveDisplayLogic = (id: number, displayLogic) => ({
  type: SAVE_DISPLAY_LOGIC, id, displayLogic,
})
export const removeDisplayLogic = (id: number): RemoveDisplayLogic => ({ type: REMOVE_DISPLAY_LOGIC, id })
export const updateAll = (pages: Page[]): UpdateAll => ({ type: UPDATE_ALL, pages })


export type AddModuleType = ReturnType<typeof addModule>
export type RemovePageType = ReturnType<typeof removePage>
export type RenamePageType = ReturnType<typeof renamePage>
export type SaveDisplayLogicType = ReturnType<typeof saveDisplayLogic>
export type RemoveDisplayLogicType = ReturnType<typeof removeDisplayLogic>
export type UpdateAllType = ReturnType<typeof updateAll>
