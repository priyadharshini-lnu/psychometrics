import { factor } from 'store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

export const getQuestions = state => state.questions
export const recodingSelector = state => state.factors.recoding

export const selectedFactor = (state, id) => state.factors.factors[id]

export const factorScoring = createSelector(selectedFactor, factor => factor && factor.scoring)
