import LogicResolver from 'libs/survey/models/logic/LogicResolver'

export default function DisplayLogicProcessor (logic, questions, results) {
  const resolver = new LogicResolver(logic, questions, results)
  return resolver.resolve()
}
