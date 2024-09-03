
declare class LogicResolver {
  constructor(logic, context: {
    questions?, results?, relationship?, dataSheet?, subjectDataSheet?, isAnonymousAssessment?
  })

  resolve(): boolean
}

export = LogicResolver
