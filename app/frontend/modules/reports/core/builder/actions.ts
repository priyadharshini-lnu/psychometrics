import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import SerializeReport from './SerializeReport'
import PageInterface from '../interfaces/Page'
import ModuleInterface from '../interfaces/Module'

export const FETCH = 'report/FETCH'
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
export const CHANGE_SIZE = 'report/CHANGE_SIZE'
export const UPDATE_PAGE_POSITIONS = 'report/UPDATE_PAGE_POSITIONS'
export const SET_PAGE_POSITIONS = 'report/SET_PAGE_POSITIONS'
export const COPY_PAGE = 'report/COPY_PAGE'
export const PASTE_PAGE = 'report/PASTE_PAGE'
export const COPY_MODULE = 'report/COPY_MODULE'
export const PASTE_MODULE = 'report/PASTE_MODULE'
export const SAVE_DATA_SHEET = 'report/SAVE_DATA_SHEET'
export const SAVE_CAMPAIGN_FACTORS = 'report/SAVE_CAMPAIGN_FACTORS'
export const SAVE_CAMPAIGN_AI_ARTIFACTS = 'report/SAVE_CAMPAIGN_AI_ARTIFACTS'
export const UPLOAD_DATA_SHEET = 'report/UPLOAD_DATA_SHEET'
export const CHANGE_SKIP_LOGIC = 'report/CHANGE_SKIP_LOGIC'
export const SET_REPORT_LOADING = 'report/SET_REPORT_LOADING'
export const IMPORT_TRANSLATIONS = 'report/IMPORT_TRANSLATIONS'
export const ADD_STYLE = 'report/ADD_STYLE'
export const UPDATE_STYLE = 'report/UPDATE_STYLE'
export const REMOVE_STYLE = 'report/REMOVE_STYLE'
export const REMAP_ASSESSMENT = 'report/REMAP_ASSESSMENT'

export enum SelectedTypes {
  'Module'= 'Module',
  'Page'= 'Page',
  'Report'= 'Report'
}

export const fetch = (id, lang) => ({
  type: FETCH,
  request: {
    url: `/administration/reports/${id}/builders`,
    camelize: false,
    body: { lang },
  },
})

export const init = (data, userReport = null, campaignId = null) => ({
  type: INIT, data, userReport, campaignId,
})
export const remapAssessment = (id: number, currentAssessmentId: number, newAssessmentId: number) => ({
  type: REMAP_ASSESSMENT,
  request: {
    method: 'put',
    url: `/administration/reports/${id}/remap_assessment`,
    body: { currentAssessmentId, newAssessmentId },
  },
})

export const openRichEditor = () => ({ type: OPEN_RICH_EDITOR })
export const closeRichEditor = () => ({ type: CLOSE_RICH_EDITOR })

export const copyPage = (pageId: number) => ({ type: COPY_PAGE, pageId })
export const pastePage = (pageId: number, modules: ModuleInterface[]) => ({
  type: PASTE_PAGE, pageId, modules,
})

export const copyModule = (moduleId: number) => ({ type: COPY_MODULE, moduleId })
export const pasteModule = (pageId: number, module: ModuleInterface) => ({
  type: PASTE_MODULE, pageId, module,
})

export const saveDataSheet = (data: object[]) => ({ type: SAVE_DATA_SHEET, data })
export const saveCampaignFactors = (data: object[]) => ({ type: SAVE_CAMPAIGN_FACTORS, data })
export const saveCampaignAIArtifacts = (data: object[]) => ({ type: SAVE_CAMPAIGN_AI_ARTIFACTS, data })

export const uploadDataSheet = (id: number, body: FormData) => ({
  type: UPLOAD_DATA_SHEET,
  request: {
    method: 'post',
    url: `/administration/reports/${id}/upload_data_sheet`,
    body,
    contentType: 'multipart/form-data;' as const,
  },
})

export const importTranslations = (reportId, formdata) => ({
  type: IMPORT_TRANSLATIONS,
  request: {
    method: 'post',
    url: `/administration/translations/reports/${reportId}/import`,
    body: formdata,
    contentType: 'multipart/form-data;' as const,
  },
})


export const renameReport = (name: string) => ({ type: RENAME_REPORT, name })
export const updateCurrentPage = (offset: number, pages: {[key: number]: PageInterface}) => ({
  type: UPDATE_CURRENT_PAGE, offset, pages,
})
export const updatePagePositions = (pageId: number | never, newIndex: number) => ({
  type: UPDATE_PAGE_POSITIONS, pageId, newIndex,
})
export const setPagePositions = (order: number[]) => ({ type: SET_PAGE_POSITIONS, order })
export const addPage = (page: PageInterface, index: number) => ({ type: ADD_PAGE, page, index })
export const selectModule = (moduleType: SelectedTypes, id: number) => ({
  type: SELECT_MODULE, moduleType, id,
})
export const unselectModules = () => ({ type: UNSELECT_MODULES })
export const changeSize = (size: {width: number, height: number}) => ({ type: CHANGE_SIZE, size })
export const changeSkipLogic = value => ({ type: CHANGE_SKIP_LOGIC, value })
export const setReportLoading = value => ({ type: SET_REPORT_LOADING, value })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      camelize: false,
    },
  }
}

export const addStyle = style => ({ type: ADD_STYLE, style })
export const updateStyle = style => ({ type: UPDATE_STYLE, style })
export const removeStyle = style => ({ type: REMOVE_STYLE, style })

export type AddStyleType = ReturnType<typeof addStyle>
export type UpdateStyleType = ReturnType<typeof updateStyle>
export type RemoveStleType = ReturnType<typeof removeStyle>
export type CopyPageType = ReturnType<typeof copyPage>
export type CopyModuleType = ReturnType<typeof copyModule>
export type PastePageType = ReturnType<typeof pastePage>
export type PasteModuleType = ReturnType<typeof pasteModule>
export type InitType = ReturnType<typeof init>
export type OpenRichEditorType = ReturnType<typeof openRichEditor>
export type CloseRichEditorType = ReturnType<typeof closeRichEditor>
export type RenameReportType = ReturnType<typeof renameReport>
export type UpdateCurrentPageType = ReturnType<typeof updateCurrentPage>
export type AddPageType = ReturnType<typeof addPage>
export type SelectModuleType = ReturnType<typeof selectModule>
export type UnselectModulesType = ReturnType<typeof unselectModules>
export type ChangeSizeType = ReturnType<typeof changeSize>
export type ChangeSkipLogic = ReturnType<typeof changeSkipLogic>
export type UpdatePagePositionType = ReturnType<typeof updatePagePositions>
export type SetPagePositionType = ReturnType<typeof setPagePositions>
export type SaveDataSheetType = ApiActionResponse<{data: {}}>
export type SaveCampaignFactorsType = ApiActionResponse<{data: {}}>
export type SaveCampaignAIArtifactsType = ApiActionResponse<{data: {}}>
export type SetReportLoading = ReturnType<typeof setReportLoading>
