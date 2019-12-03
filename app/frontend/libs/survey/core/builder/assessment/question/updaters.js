import Question from 'models/Question'


export const questionsLoader = (questions, block, trash) => {
  const list = []
  _.each(questions, (question) => {
    const model = new Question(question, block)
    if (!question.deleted) {
      list.push(model)
    } else if (!block.deleted) {
      trash.push({ type: 'Question', model })
    }
  })
  return list
}

export const removeQuestion = (block, question) => {
  const newBlock = _.clone(block)
  const questions = _.clone(newBlock.questions)
  _.remove(questions, question)
  newBlock.questions = questions
  return newBlock
}

export const createQuestion = (block, data) => {
  const last = (_.last(block.questions) || {}).position
  const question = new Question(data, block)
  question.position = (typeof last !== 'undefined') ? last + 1 : 1
  return question
}
