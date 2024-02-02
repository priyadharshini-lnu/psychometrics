import SerializeAssessment from './SerializeAssessment'
import SerializeTrash from './SerializeTrash'
import { trashItems } from './selectors'

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

export const saveAssessment = (data) => {
  const builder = {
    assessment: SerializeAssessment.run(data),
    trash: SerializeTrash.run(trashItems({ survey: { builder: data } })),
  }

  return {
    type: SAVE,
    request: {
      method: 'PUT',
      url: `/administration/assessments/${data.assessment.id}/builders`,
      body: { builder },
      camelize: false,
      decamelize: false,
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
