/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createReducer } from 'utils/reduxUtils'
import { setIn, updateIn } from 'utils/immutable'
import {
  INIT, ENABLE, DISABLE, OPEN_RICH_EDITOR, SELECT_MODULE, UNSELECT_MODULES,
  CLOSE_RICH_EDITOR, RENAME_REPORT, UPDATE_CURRENT_PAGE, ADD_PAGE, CHANGE_SIZE,
} from './actions'

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
}

const HANDLERS = {
  [INIT]: (state, { data }) => {
    // console.log(data)
    const report = data.entities.report[data.result]

    return {
      ...state,
      ...report,
      assessments: data.entities.assessments,
      questions: data.entities.questions,
      loaded: true,
      currentPage: report.pages[0],
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
  [ADD_PAGE]: (state, { page, index }) => updateIn(
    state, 'pages', pages => ([...pages.slice(0, index), page.id, ...pages.slice(index)]),
  ),
  [SELECT_MODULE]: (state, { moduleType, id }) => setIn(state, 'selected', { type: moduleType, moduleId: id }),
  [UNSELECT_MODULES]: state => ({ ...state, selected: {} }),
  [CHANGE_SIZE]: (state, { size }) => setIn(state, ['props', 'sizes'], size),
}

export default createReducer(HANDLERS, defaultState)
