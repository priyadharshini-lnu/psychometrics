import _ from 'lodash'

export const getParticipantOption = state => _.get(state, ['threeSixtyCampaign', 'participantOptions'])
export const getSubjectOption = state => _.get(getParticipantOption(state), ['subject'])
export const getManagerOption = state => _.get(getParticipantOption(state), ['manager'])
export const getEvaluatorOption = state => _.get(getParticipantOption(state), ['evaluator'])
