import NormResolver from 'libs/survey/models/NormResolver'
import _ from 'lodash'
import { QuestionsInterface, ResultsInterface } from '../interfaces'

const MapNorms = {
  run (rules, hris: {}, questions: QuestionsInterface, results: ResultsInterface): {id: string} {
    const resolver = new NormResolver(rules, hris, questions, results)
    return resolver.resolve()
  },
}

export default MapNorms
