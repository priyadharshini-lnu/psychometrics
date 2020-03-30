/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createReducer } from 'utils/reduxUtils'
import {
  INIT, ENABLE, DISABLE, OPEN_RICH_EDITOR,
  CLOSE_RICH_EDITOR,
} from './actions'

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
  pages: {},
  modules: {},
  innovation_styles: {},
  norm_used: {},
  result_locale: {},
  default_language: {},
  locales: {},
  assessments: {},
  blocks: {},
  questions: {},
  richEditorOpened: false,
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
    }
  },
  [ENABLE]: state => ({ ...state, disabled: false }),
  [DISABLE]: state => ({ ...state, disabled: true }),
  [OPEN_RICH_EDITOR]: state => ({ ...state, richEditorOpened: true }),
  [CLOSE_RICH_EDITOR]: state => ({ ...state, richEditorOpened: false }),
}

export default createReducer(HANDLERS, defaultState)
