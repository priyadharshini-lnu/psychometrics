
declare class LogicResolver {
  constructor(logic, context: { questions?, results?, relationship?, dataSheet?, subjectDataSheet?})

  resolve(): boolean
}

export = LogicResolver
