/* eslint-disable @typescript-eslint/explicit-function-return-type */
import SerializeReport from './SerializeReport'
import PageInterface from '../interfaces/Page'

export const INIT = 'report/INIT'
export const ENABLE = 'report/ENABLE'
export const DISABLE = 'report/DISABLE'
export const OPEN_RICH_EDITOR = 'report/OPEN_RICH_EDITOR'
export const CLOSE_RICH_EDITOR = 'report/CLOSE_RICH_EDITOR'
export const RENAME_REPORT = 'report/RENAME_REPORT'
export const UPDATE_CURRENT_PAGE = 'report/UPDATE_CURRENT_PAGE'
export const SAVE_REPORT = 'report/SAVE_REPORT'
export const ADD_PAGE = 'report/ADD_PAGE'
export const SELECT_MODULE = 'report/SELECT_MODULE'
export const UNSELECT_MODULES = 'report/UNSELECT_MODULES'
export const SHOW_ON_ALL_PAGES = 'report/SHOW_ON_ALL_PAGES'

enum SelectedTypes {
  'Module',
  'Page',
  'Report'
}

interface OpenRichEditor { type: typeof OPEN_RICH_EDITOR }
interface CloseRichEditor { type: typeof CLOSE_RICH_EDITOR }
interface RenameReport { type: typeof RENAME_REPORT, name: string }
interface UpdateCurrentPage { type: typeof UPDATE_CURRENT_PAGE, offset: number }
interface AddPage { type: typeof ADD_PAGE, page: PageInterface, index?: number }
interface SelectModule { type: typeof SELECT_MODULE, moduleType: SelectedTypes, id: number }
interface UnselectModules { type: typeof UNSELECT_MODULES }

export const openRichEditor = (): OpenRichEditor => ({ type: OPEN_RICH_EDITOR })
export const closeRichEditor = (): CloseRichEditor => ({ type: CLOSE_RICH_EDITOR })

export const renameReport = (name: string): RenameReport => ({ type: RENAME_REPORT, name })
export const updateCurrentPage = (offset: number): UpdateCurrentPage => ({ type: UPDATE_CURRENT_PAGE, offset })

export const addPage = (page: PageInterface, index: number): AddPage => ({ type: ADD_PAGE, page, index })
export const selectModule = (moduleType: SelectedTypes, id: number): SelectModule => ({
  type: SELECT_MODULE, moduleType, id,
})
export const unselectModules = (): UnselectModules => ({ type: UNSELECT_MODULES })

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export const save = (report: any) => {
  const builder = {
    report: SerializeReport.run(report),
  }

  return {
    type: SAVE_REPORT,
    request: {
      method: 'PUT',
      url: `/administration/reports/${report.builder.id}/builders`,
      body: builder,
      decamelize: false,
    },
  }
}
