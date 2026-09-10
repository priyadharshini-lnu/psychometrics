import { normalize } from 'normalizr'
import SerializeAssessment from './SerializeAssessment'
import SerializeTrash from './SerializeTrash'
import { trashItems } from './selectors'
import schema from '~/modules/survey/store/schema'

export const FETCH = 'survey/assessment/FETCH'
export const INIT = 'survey/assessment/INIT'
export const SELECT_QUESTION = 'survey/assessment/SELECT'
export const UNSELECT_QUESTION = 'survey/assessment/UNSELECT'
export const ENABLE = 'survey/assessment/ENABLE'
export const DISABLE = 'survey/assessment/DISABLE'
export const EMPTY_TRASH = 'survey/assessment/EMPTY_TRASH'
export const MOVE_BLOCK_DOWN = 'survey/assessment/MOVE_BLOCK_DOWN'
export const MOVE_BLOCK_UP = 'survey/assessment/MOVE_BLOCK_UP'
export const ADD_NORM_RULE = 'survey/assessment/ADD_NORM_RULE'
export const REMOVE_NORM_RULE = 'survey/assessment/REMOVE_NORM_RULE'
export const CHANGE_DEFAULT_NORM = 'survey/assessment/CHANGE_DEFAULT_NORM'
export const UPDATE_FLOW = 'survey/assessment/UPDATE_FLOW'
export const TOGGLE_ENABLE_BACK = 'survey/assessment/TOGGLE_ENABLE_BACK'
export const TOGGLE_ENABLE_PROGRESS = 'survey/assessment/TOGGLE_ENABLE_PROGRESS'
export const TOGGLE_ENABLE_SINGLE_QUESTION = 'survey/assessment/TOGGLE_ENABLE_SINGLE_QUESTION'
export const SAVE = 'survey/assessment/SAVE'
export const SAVE_REQUEST = 'survey/assessment/SAVE_REQUEST'
export const SAVE_FAILURE = 'survey/assessment/SAVE_FAILURE'
export const SAVE_DATA_SHEET = 'builder/assessment/SAVE_DATA_SHEET'
export const UPLOAD_DATA_SHEET = 'builder/assessment/UPLOAD_DATA_SHEET'
export const UPDATE_EXTRA = 'builder/assessment/UPDATE_EXTRA'
export const TOGGLE_INSTRUCTIONS = 'builder/assessment/TOGGLE_INSTRUCTIONS'
export const UPDATE_INSTRUCTIONS_CONTENT = 'builder/assessment/UPDATE_INSTRUCTIONS_CONTENT'
export const UPDATE_LINKED_QUESTIONS = 'builder/assessment/UPDATE_LINKED_QUESTIONS'
export const TOGGLE_ENABLE_SAVE = 'survey/assessment/TOGGLE_ENABLE_SAVE'
export const SAVE_CAMPAIGN_FACTORS = 'builder/assessment/SAVE_CAMPAIGN_FACTORS'

export const FETCH_NORMS = 'builder/assessment/FETCH_NORMS'
export const fetchNorms = assessmentId => ({
  type: FETCH_NORMS,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/norms`,
    camelize: false,
  },
})

export const FETCH_BLOCK_TEMPLATES = 'builder/assessment/FETCH_BLOCK_TEMPLATES'
export const fetchBlockTemplates = (assessmentId, params) => ({
  type: FETCH_BLOCK_TEMPLATES,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/block_templates`,
    body: params,
    camelize: false,
  },
})

export const FETCH_QUESTION_TEMPLATES = 'builder/assessment/FETCH_QUESTION_TEMPLATES'
export const fetchQuestionTemplates = (assessmentId, params) => ({
  type: FETCH_QUESTION_TEMPLATES,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/question_templates`,
    body: params,
    camelize: false,
  },
})

export const FETCH_BLOCK_TEMPLATE = 'builder/assessment/FETCH_BLOCK_TEMPLATE'
export const fetchBlockTemplate = (assessmentId, templateId) => ({
  type: FETCH_BLOCK_TEMPLATE,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/block_template`,
    body: { template_id: templateId },
    camelize: false,
  },
})

export const FETCH_QUESTION_TEMPLATE = 'builder/assessment/FETCH_QUESTION_TEMPLATE'
export const fetchQuestionTemplate = (assessmentId, templateId) => ({
  type: FETCH_QUESTION_TEMPLATE,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/question_template`,
    body: { template_id: templateId },
    camelize: false,
  },
})

export const FETCH_GEO = 'builder/assessment/FETCH_GEO'
export const fetchGeo = (assessmentId, params) => ({
  type: FETCH_GEO,
  request: {
    url: `/administration/assessments/${assessmentId}/builders/geo`,
    body: params,
    camelize: false,
  },
})

export const fetch = (assessmentId, currentLocale) => ({
  type: FETCH,
  request: {
    url: `/administration/assessments/${assessmentId}/builders`,
    body: {
      assessmentLang: currentLocale,
    },
    camelize: false,
    loader: true,
  },
})

export const init = data => ({ type: INIT, data: normalize(data, schema) })

export const initFromBlock = blockData => init({
  id: blockData.id,
  blocks: [blockData],
  factors: {},
  question_recoding: [],
  flow: {},
})

export const selectQuestion = (question, offset) => ({ type: SELECT_QUESTION, question, offset })

export const unselectQuestion = () => ({ type: UNSELECT_QUESTION })
export const emptyTrash = () => ({ type: EMPTY_TRASH })

export const moveBlockDown = block => ({ type: MOVE_BLOCK_DOWN, block })
export const moveBlockUp = block => ({ type: MOVE_BLOCK_UP, block })

export const addNormRule = rule => ({ type: ADD_NORM_RULE, rule })
export const removeNormRule = index => ({ type: REMOVE_NORM_RULE, index })
export const changeDefaultNorm = id => ({ type: CHANGE_DEFAULT_NORM, id })


export const updateFlow = flow => ({ type: UPDATE_FLOW, flow })

export const toggleEnableBack = () => ({ type: TOGGLE_ENABLE_BACK })
export const toggleEnableProgress = () => ({ type: TOGGLE_ENABLE_PROGRESS })
export const toggleSingleQuestionPage = () => ({ type: TOGGLE_ENABLE_SINGLE_QUESTION })
export const updateLinkedQuestions = (id, questions) => ({ type: UPDATE_LINKED_QUESTIONS, id, questions })
export const toggleEnableSave = () => ({ type: TOGGLE_ENABLE_SAVE })
export const saveCampaignFactors = data => ({ type: SAVE_CAMPAIGN_FACTORS, data })


export const saveAssessment = (data, currentLocale) => {
  const builder = {
    assessment: SerializeAssessment.run(data),
    trash: SerializeTrash.run(trashItems({ survey: { builder: data } })),
    locale: currentLocale,
  }

  return {
    type: SAVE,
    request: {
      method: 'PUT',
      url: `/administration/assessments/${data.assessment.id}/builders`,
      body: { builder },
      camelize: false,
      decamelize: false,
      loader: true,
    },
  }
}

export const updateExtra = extra => ({ type: UPDATE_EXTRA, extra })

export const saveDataSheet = data => ({ type: SAVE_DATA_SHEET, data })

export const uploadDataSheet = (id, body) => ({
  type: UPLOAD_DATA_SHEET,
  request: {
    method: 'post',
    url: `/administration/assessments/${id}/upload_data_sheet`,
    body,
    contentType: 'multipart/form-data;',
  },
})

export const toggleInstructions = () => ({ type: TOGGLE_INSTRUCTIONS })

export const updateInstructionsContent = content => ({ type: UPDATE_INSTRUCTIONS_CONTENT, content })

export const IMPORT_QUESTIONS = 'builder/assessment/IMPORT_QUESTIONS'
export const importQuestions = (assessmentId, body) => ({
  type: IMPORT_QUESTIONS,
  request: {
    url: `/administration/assessments/${assessmentId}/import_questions`,
    method: 'post',
    body,
    contentType: 'multipart/form-data;',
  },
})

export const exportQuestions = assessmentId => ({
  type: 'builder/assessment/EXPORT_QUESTIONS',
  request: {
    url: `/administration/assessments/${assessmentId}/export_questions`,
    method: 'post',
  },
})
