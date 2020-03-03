
declare class LogicResolver {
  constructor(logic, context: {questions?, results?, relationship?, dataSheet?})

  resolve(): boolean
}

export = LogicResolver
