import NormResolver from 'libs/survey/models/NormResolver'
import _ from 'lodash'

export default function MapNorms (rules, hris, questions, results): {id: string} {
  const resolver = new NormResolver(rules, hris, questions, results)
  return resolver.resolve()
}
