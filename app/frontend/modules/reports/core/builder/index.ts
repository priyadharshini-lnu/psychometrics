/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _ from 'lodash'
import { createReducer } from 'utils/redux'
import { setIn } from 'utils/immutable'
import {
  INIT, ENABLE, DISABLE, OPEN_RICH_EDITOR, SELECT_MODULE, UNSELECT_MODULES,
  CLOSE_RICH_EDITOR, RENAME_REPORT, UPDATE_CURRENT_PAGE, ADD_PAGE, CHANGE_SIZE,
  UPDATE_PAGE_POSITIONS, COPY_PAGE, COPY_MODULE, SAVE_DATA_SHEET,
} from './actions'
import { PAGE_SIZES, BASE_FONT_SIZE } from './consts'

const VERTICAL_SPACE_BETWEEN_PAGES = 95

export const defaultState = {
  id: null,
  loaded: false,
  disabled: false,
  saving: false,
  name: '',
  filters: [],
  factors: [],
  factor_norms: [],
  occupations: [],
  props: {},
  dimension_ids: [],
  completed_assessments: [],
  data_configuration: '',
  data_sheet_columns: [],
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
}

const HANDLERS = {
  [INIT]: (state, { data }) => {
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
      currentPage: state.currentPage || report.pages[0],
    }
  },
  [ENABLE]: state => ({ ...state, disabled: false }),
  [DISABLE]: state => ({ ...state, disabled: true }),
  [OPEN_RICH_EDITOR]: state => ({ ...state, richEditorOpened: true }),
  [CLOSE_RICH_EDITOR]: state => ({ ...state, richEditorOpened: false }),
  [RENAME_REPORT]: (state, { name }) => setIn(state, 'name', name),
  [UPDATE_CURRENT_PAGE]: (state, { offset }) => {
    const index = Math.round(offset / (state.props.sizes.height + VERTICAL_SPACE_BETWEEN_PAGES))
    const page = state.pages[index]
    return setIn(state, 'currentPage', page)
  },
  [ADD_PAGE]: (state, { page, index }) => ({
    ...state,
    pages: ([...state.pages.slice(0, index), page.id, ...state.pages.slice(index)]),
    currentPage: page.id,
  }),
  [SELECT_MODULE]: (state, { moduleType, id }) => setIn(state, 'selected', { type: moduleType, moduleId: id }),
  [UNSELECT_MODULES]: state => ({ ...state, selected: {} }),
  [CHANGE_SIZE]: (state, { size }) => setIn(state, ['props', 'sizes'], size),
  [UPDATE_PAGE_POSITIONS]: (state, { pageId, newIndex }) => {
    const pages = _.filter(state.pages, page => page !== pageId)
    pages.splice(newIndex, 0, pageId)
    return { ...state, pages }
  },
  [COPY_PAGE]: (state, { pageId }) => setIn(state, ['buffer', 'sourceId'], pageId),
  [COPY_MODULE]: (state, { moduleId }) => setIn(state, ['buffer', 'moduleId'], moduleId),
  [SAVE_DATA_SHEET]: (state, { data }) => setIn(state, ['data_sheet_columns'], data),
}

export default createReducer(HANDLERS, defaultState)
