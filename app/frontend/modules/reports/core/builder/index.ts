/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from '~/utils/redux'
import { setIn } from '~/utils/immutable'
import {
  INIT, ENABLE, DISABLE, OPEN_RICH_EDITOR, SELECT_MODULE, UNSELECT_MODULES,
  CLOSE_RICH_EDITOR, RENAME_REPORT, UPDATE_CURRENT_PAGE, ADD_PAGE, CHANGE_SIZE,
  UPDATE_PAGE_POSITIONS, COPY_PAGE, COPY_MODULE, SAVE_DATA_SHEET, CHANGE_SKIP_LOGIC,
  InitType, RenameReportType, UpdateCurrentPageType, AddPageType, SelectModuleType,
  ChangeSizeType, UpdatePagePositionType, SaveDataSheetType, CopyModuleType, CopyPageType,
  ChangeSkipLogic,
  SetReportLoading,
  SAVE_CAMPAIGN_FACTORS,
  ADD_STYLE,
  UPDATE_STYLE,
  AddStyleType,
  UpdateStyleType,
  REMOVE_STYLE,
  SaveCampaignFactorsType,
  SET_REPORT_LOADING,
} from './actions'
import { PAGE_SIZES, BASE_FONT_SIZE } from './consts'
import { Style } from '../interfaces/Report'

const VERTICAL_SPACE_BETWEEN_PAGES = 95
const DATA_CONFIFURATION_REF = 'ref'
const SUPPORTED_DATA_CONFIFURATION = ['formula', 'mapped_value', 'normed_factor', 'raw_factor', 'zscore_to_percentile']

interface DataConfigurationItem {
  key: string,
  type: string
  label: string,
  ref?: string,
  ref_id?: string
}
interface DataConfigurationSection {
  label: string,
  data: DataConfigurationItem
}

interface State {
  id: number | null,
  loaded: boolean,
  disabled: boolean,
  saving: boolean,
  name: string,
  filters: [],
  factors: [],
  factor_norms: [],
  occupations: [],
  props: {
    sizes: {
      height: number
      width: number
    }
  },
  dimension_ids: [],
  completed_assessments: [],
  data_configuration: {
    refs: DataConfigurationItem[],
    sections: DataConfigurationSection[]
  },
  data_sheet_columns: [],
  campaign_factors: [],
  relationships: [],
  pages: number[],
  innovation_styles: {},
  norm_used: {},
  result_locale: {},
  default_language: {},
  locales: {},
  assessments: {},
  blocks: {},
  questions: {},
  richEditorOpened: boolean,
  currentPage: number,
  selected: {
    type: string | null,
    moduleId: number | null,
  },
  buffer: {
    sourceId: number | null,
    moduleId: number | null,
  },
  pdfExport: boolean,
  styles: {[id:string]: Style},
  flip_content: boolean
}

export const defaultState: State = {
  id: null,
  loaded: false,
  disabled: false,
  saving: false,
  name: '',
  filters: [],
  factors: [],
  factor_norms: [],
  occupations: [],
  props: {
    sizes: {
      height: 0,
      width: 0,
    },
  },
  dimension_ids: [],
  completed_assessments: [],
  data_configuration: { refs: [], sections: [] },
  data_sheet_columns: [],
  campaign_factors: [],
  relationships: [],
  pages: [],
  innovation_styles: {},
  norm_used: {},
  result_locale: {},
  default_language: {},
  locales: {},
  assessments: {},
  blocks: {},
  questions: {},
  richEditorOpened: false,
  currentPage: 0,
  selected: {
    type: null,
    moduleId: null,
  },
  buffer: {
    sourceId: null,
    moduleId: null,
  },
  pdfExport: false,
  styles: {},
  flip_content: false,
}


export const getSupportedDataConfiguration = (state) => {
  const { data_configuration } = state.report.builder
  if (!data_configuration || !data_configuration.sections) return []
  const items = _.flatten(data_configuration.sections.map(section => section.data))
    .map((item: DataConfigurationItem) => {
      if (SUPPORTED_DATA_CONFIFURATION.includes(item.type)) return item
      if (item.type !== DATA_CONFIFURATION_REF) return null

      return _.find(
        data_configuration.refs,
        ref => (SUPPORTED_DATA_CONFIFURATION.includes(ref.type) && ref.ref_id === item.ref),
      )
    })

  return _.compact(items)
}

const HANDLERS = {
  [INIT]: (state: State, { data, campaignId }: InitType) => {
    const report = data.entities.report[data.result]
    return {
      ...state,
      ...report,
      props: report.props.sizes
        ? report.props
        : { width: PAGE_SIZES[0].width, height: PAGE_SIZES[0].height, fontSize: BASE_FONT_SIZE },
      assessments: data.entities.assessments,
      blocks: data.entities.blocks,
      questions: data.entities.questions,
      loaded: true,
      currentPage: report.pages[0],
      campaignId,
    }
  },
  [ENABLE]: (state: State) => ({ ...state, disabled: false }),
  [DISABLE]: (state: State) => ({ ...state, disabled: true }),
  [OPEN_RICH_EDITOR]: (state: State) => ({ ...state, richEditorOpened: true }),
  [CLOSE_RICH_EDITOR]: (state: State) => ({ ...state, richEditorOpened: false }),
  [RENAME_REPORT]: (state: State, { name }: RenameReportType) => setIn(state, 'name', name),
  [UPDATE_CURRENT_PAGE]: (state: State, { offset, pages }: UpdateCurrentPageType) => {
    const index = Math.round(offset / (state.props.sizes.height + VERTICAL_SPACE_BETWEEN_PAGES))
    const page = _.filter(state.pages, p => !pages[p].removed)[index]
    if (!page) { return state }
    return setIn(state, 'currentPage', page)
  },
  [ADD_PAGE]: (state: State, { page, index }: AddPageType) => ({
    ...state,
    pages: ([...state.pages.slice(0, index), page.id, ...state.pages.slice(index)]),
    currentPage: page.id,
  }),
  [SELECT_MODULE]: (state: State, { moduleType, id }: SelectModuleType) => setIn(
    state, 'selected', { type: moduleType, moduleId: id },
  ),
  [UNSELECT_MODULES]: (state: State) => ({ ...state, selected: { type: null, moduleId: null } }),
  [CHANGE_SIZE]: (state: State, { size }: ChangeSizeType) => setIn(state, ['props', 'sizes'], size),
  [UPDATE_PAGE_POSITIONS]: (state: State, { pageId, newIndex }: UpdatePagePositionType) => {
    const pages = _.filter(state.pages, page => page !== pageId)
    return { ...state, pages: ([...pages.slice(0, newIndex), pageId, ...pages.slice(newIndex)]) }
  },
  [COPY_PAGE]: (state: State, { pageId }: CopyPageType) => setIn(state, ['buffer', 'sourceId'], pageId),
  [COPY_MODULE]: (state: State, { moduleId }: CopyModuleType) => setIn(state, ['buffer', 'moduleId'], moduleId),
  [SAVE_DATA_SHEET]: (state: State, { data }: SaveDataSheetType) => setIn(state, ['data_sheet_columns'], data),
  [SAVE_CAMPAIGN_FACTORS]: (state: State, { data }:
    SaveCampaignFactorsType) => setIn(state, ['campaign_factors'], data),
  [CHANGE_SKIP_LOGIC]: (state: State, { value }: ChangeSkipLogic) => setIn(state, ['skipLogic'], value),
  [ADD_STYLE]: (state: State, { style }: AddStyleType) => ({
    ...state, styles: { ...state.styles, [style.id]: style },
  }),
  [UPDATE_STYLE]: (state: State, { style }: UpdateStyleType) => ({
    ...state, styles: { ...state.styles, [style.id]: style },
  }),
  [REMOVE_STYLE]: (state: State, { style }: UpdateStyleType) => ({
    ...state, styles: _.omit(state.styles, style.id),
  }),
  [SET_REPORT_LOADING]: (state: State, { value }: SetReportLoading) => setIn(state, ['loaded'], value),

}


export default createReducer(HANDLERS, defaultState)
