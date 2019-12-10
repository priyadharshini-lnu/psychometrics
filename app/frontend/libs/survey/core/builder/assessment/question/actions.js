export const ADD_QUESTION = 'builder/assessment/question/ADD_QUESTION'
export const ADD_QUESTIONS = 'builder/assessment/question/ADD_QUESTIONS'
export const CHANGE_TYPE = 'builder/assessment/question/CHANGE_TYPE'
export const UPDATE_POSITIONS = 'builder/assessment/question/UPDATE_POSITIONS'
export const UPDATE_QUESTION = 'builder/assessment/question/UPDATE_QUESTION'
export const ADD_SKIP_LOGIC = 'builder/assessment/question/ADD_SKIP_LOGIC'
export const REMOVE_SKIP_LOGIC = 'builder/assessment/question/REMOVE_SKIP_LOGIC'
export const SAVE_DISPLAY_LOGIC = 'builder/assessment/question/SAVE_DISPLAY_LOGIC'
export const RENAME_QUESTION = 'builder/assessment/question/RENAME_QUESTION'
export const PERMANENT_REMOVE = 'builder/assessment/question/PERMANENT_REMOVE'
export const SAVE_AS_TEMPLATE = 'builder/assessment/question/SAVE_AS_TEMPLATE'
export const UNLINK_TEMPLATE = 'builder/assessment/question/UNLINK_TEMPLATE'

export const updateQuestion = question => ({
  type: UPDATE_QUESTION, question,
})

export const createQuestion = question => ({
  type: ADD_QUESTION, question,
})

export const createQuestions = questions => ({
  type: ADD_QUESTIONS, questions,
})

export const changeType = (question, type, props) => ({
  type: CHANGE_TYPE, question, qtype: type, props,
})

export const updatePositions = block => ({
  type: UPDATE_POSITIONS, block,
})

export const addSkipLogic = question => ({
  type: ADD_SKIP_LOGIC, question,
})

export const removeSkipLogic = (question, condition) => ({
  type: REMOVE_SKIP_LOGIC, question, condition,
})

export const saveDisplayLogic = (question, logicElement) => ({
  type: SAVE_DISPLAY_LOGIC, question, logicElement,
})

export const renameQuestion = (question, value) => ({
  type: RENAME_QUESTION, question, value,
})

export const permanentRemoveQuestion = question => ({
  type: PERMANENT_REMOVE, question,
})

export const saveAsTemplate = question => ({
  type: SAVE_AS_TEMPLATE, question,
})

export const unlinkTemplate = question => ({
  type: UNLINK_TEMPLATE, question,
})
