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


      const questions = _.reduce(b.questions, (questions: number[], q) => {
        if (q.deleted) { return questions }

        if (q.type === 'PageBreak') {
          if (questions.length) {
            pages[symbolId] = [...pages[symbolId], { questions, blockId: b.id }]
          }
          return []
        }

        if (options.enable_single_question_page) {
          if (questions.length > 0) {
            const prev = _.find(b.questions, { id: questions[0] })
            const skipLogic = prev?.skip_logic?.length ? { skipLogic: prev.skip_logic } : {}
            pages[symbolId] = [...pages[symbolId], { questions, blockId: b.id, ...skipLogic }]
          }

          return [q.id]
        }

        if (q.display_logic) {
          if (questions.length > 0) {
            pages[symbolId] = [...pages[symbolId], { questions, blockId: b.id }]
          }
          questions = [q.id]
        }

        if (q.skip_logic && q.skip_logic.length) {
          if (!_.includes(questions, q.id)) {
            questions = [...questions, q.id]
          }
          const attrs = {
            questions, blockId: b.id, skipLogic: q.skip_logic,
          }

          pages[symbolId] = [...pages[symbolId], attrs]
          return []
        }

        if (!_.includes(questions, q.id)) {
          questions = [...questions, q.id]
        }

        return questions
      }, [])

      if (questions.length) {
        const attrs = {
          questions, blockId: b.id,
        }

        pages[symbolId] = [...pages[symbolId], attrs]
      }
      if (b.props && b.props.randomization) {
        pages[symbolId] = RandomizeBlockQuestions.run(b.props.randomization, pages[symbolId], seed + b.id)
      }
      return { ...pages }
    }, {})
  },
}

export default InitPages
