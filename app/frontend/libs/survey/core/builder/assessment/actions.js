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

export const FAKE_UPDATE = 'survey/assessment/FAKE_UPDATE'

export const selectQuestion = (question, offset) => ({ type: SELECT_QUESTION, question, offset })

export const unselectQuestion = () => ({ type: UNSELECT_QUESTION })
export const emptyTrash = () => ({ type: EMPTY_TRASH })

export const moveBlockDown = block => ({ type: MOVE_BLOCK_DOWN, block })
export const moveBlockUp = block => ({ type: MOVE_BLOCK_UP, block })

export const addNormRule = rule => ({ type: ADD_NORM_RULE, rule })
export const removeNormRule = rule => ({ type: REMOVE_NORM_RULE, rule })
