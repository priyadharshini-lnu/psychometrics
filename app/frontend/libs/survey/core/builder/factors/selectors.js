import { factor } from 'store/schema'
import { createSelector } from 'reselect'
import { denormalize } from 'normalizr'

export const factorsSelector = (state, ids) => denormalize(ids, [factor], state)
export const recodingSelector = state => state.factors.recoding

export const selectedFactor = (state, id) => state.factors.factors[id]

export const factorScoring = createSelector(selectedFactor, factor => factor && factor.scoring)
