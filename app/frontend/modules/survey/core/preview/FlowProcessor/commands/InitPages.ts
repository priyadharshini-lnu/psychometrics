import _ from 'lodash'
import { BlocksInterface, PageInterface, AssessmentOptions } from '../interfaces'
import RandomizeBlockQuestions from './RandomizeBlockQuestions'

const InitPages = {
  run (data: BlocksInterface, seed = '', options: AssessmentOptions = {}): {[key: number]: PageInterface[]} {
    const { blocks } = data
    return _.reduce(blocks, (pages, b) => {
      if (b.deleted) { return pages }
      const symbolId = Symbol.for(b.id.toString())
      pages = { ...pages, [symbolId]: [] }

      if (b.props?.randomization?.type === 'QuestionsPerPage') {
        const questionChunks = _.chunk(
          b.questions.filter(q => !q.deleted && q.type !== 'PageBreak').map(q => q.id),
          b.props.randomization.questions,
        )

        pages[symbolId] = questionChunks.map(chunk => ({
          questions: chunk,
          blockId: b.id,
        }))
      } else {
        const questions = b.questions.reduce((acc, question) => {
          if (question.deleted) return acc

          if (question.type === 'PageBreak' && acc.length) {
            pages[symbolId] = [
              ...pages[symbolId],
              { questions: acc, blockId: b.id },
            ]
            return []
          }

          if (options.enable_single_question_page && acc.length) {
            const prev = b.questions.find(q => q.id === acc[0])
            const skipLogic = prev?.skip_logic?.length ? { skipLogic: prev.skip_logic } : {}
            pages[symbolId] = [
              ...pages[symbolId],
              { questions: acc, blockId: b.id, ...skipLogic },
            ]
            return [question.id]
          }

          if (question.display_logic || (question.skip_logic && question.skip_logic.length)) {
            if (acc.length) {
              pages[symbolId] = [
                ...pages[symbolId],
                { questions: acc, blockId: b.id },
              ]
            }

            const newEntry = {
              questions: [question.id],
              blockId: b.id,
              ...(question.skip_logic ? { skipLogic: question.skip_logic } : {}),
            }
            pages[symbolId] = [...pages[symbolId], newEntry]
            return []
          }

          return [...acc, question.id]
        }, [])

        if (questions.length) {
          pages[symbolId] = [
            ...pages[symbolId],
            { questions, blockId: b.id },
          ]
        }
      }

      if (b.props?.randomization) {
        pages[symbolId] = RandomizeBlockQuestions.run(
          b.props.randomization,
          pages[symbolId],
          seed + b.id,
          data.factors,
        )
      }
      return { ...pages }
    },
    {})
  },
}

export default InitPages
