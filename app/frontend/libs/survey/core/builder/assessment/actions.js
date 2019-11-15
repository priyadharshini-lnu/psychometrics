import { SELECT_QUESTION, UNSELECT_QUESTION } from './types'

export const selectQuestion = (question, offset) => ({ type: SELECT_QUESTION, question, offset })

export const unselectQuestion = () => ({ type: UNSELECT_QUESTION })
