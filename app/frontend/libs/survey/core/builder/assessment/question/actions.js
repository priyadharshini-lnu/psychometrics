export const ADD_QUESTION = 'builder/assessment/question/ADD_QUESTION'
export const CREATE_PAGE_BREAK = 'builder/assessment/question/CREATE_PAGE_BREAK'
export const INSERT_AFTER = 'builder/assessment/question/INSERT_AFTER'
export const INSERT_BEFORE = 'builder/assessment/question/INSERT_BEFORE'
export const REMOVE = 'builder/assessment/question/REMOVE'
export const RESTORE = 'builder/assessment/question/RESTORE'
export const MOVE_UP = 'builder/assessment/question/MOVE_UP'
export const MOVE_DOWN = 'builder/assessment/question/MOVE_DOWN'
export const UPDATE_POSITIONS = 'builder/assessment/question/UPDATE_POSITIONS'

export const removeQuestion = question => ({
  type: REMOVE, question,
})

export const createQuestion = question => ({
  type: ADD_QUESTION, question,
})

export const insertAfter = question => ({
  type: INSERT_AFTER, question,
})

export const insertBefore = question => ({
  type: INSERT_BEFORE, question,
})

export const updatePositions = block => ({
  type: UPDATE_POSITIONS, block,
})

export const moveDown = question => ({
  type: MOVE_DOWN, question,
})
