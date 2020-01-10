import LogicResolver from 'models/logic/LogicResolver'

export default function DisplayLogicProcessor (questions, results, logic) {
  const resolver = new LogicResolver(logic, questions, results)
  return resolver.resolve()
}
