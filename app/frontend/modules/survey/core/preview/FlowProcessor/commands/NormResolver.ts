/* eslint-disable @typescript-eslint/no-explicit-any */
import NormResolver from 'modules/survey/models/NormResolver'
import _ from 'lodash'
import QuestionSerializer from 'modules/survey/models/QuestionSerializer'
import { QuestionsInterface, ResultsInterface } from '../interfaces'

const MapNorms = {
  run (rules: any, hris: any, questions: QuestionsInterface, results: ResultsInterface): {id: string} {
    const qwraps = _.map(questions, q => QuestionSerializer.wrap(q, results[q.id]?.answers))
    const resolver = new NormResolver(rules, hris, qwraps, results)
    return resolver.resolve()
  },
}

export default MapNorms
