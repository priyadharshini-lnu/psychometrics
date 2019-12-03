export const INIT = 'survey/assessment/INIT'
export const SELECT_QUESTION = 'survey/assessment/SELECT'
export const UNSELECT_QUESTION = 'survey/assessment/UNSELECT'
export const ENABLE = 'survey/assessment/ENABLE'
export const DISABLE = 'survey/assessment/DISABLE'
export const EMPTY_TRASH = 'survey/assessment/EMPTY_TRASH'
export const FAKE_UPDATE = 'survey/assessment/FAKE_UPDATE'

export const selectQuestion = (question, offset) => ({ type: SELECT_QUESTION, question, offset })

export const unselectQuestion = () => ({ type: UNSELECT_QUESTION })
export const emptyTrash = () => ({ type: EMPTY_TRASH })
