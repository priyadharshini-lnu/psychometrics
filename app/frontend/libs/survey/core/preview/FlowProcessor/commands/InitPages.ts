import _ from 'lodash'
import { BlocksInterface, PageInterface } from '../interfaces'
import RandomizeBlockQuestions from './RandomizeBlockQuestions'

const InitPages = {
  run (data: BlocksInterface, seed = ''): {[key: number]: PageInterface[]} {
    const { blocks } = data
    return _.reduce(blocks, (pages, b) => {
      if (b.deleted) { return pages }
      pages = { ...pages, [b.id]: [] }

      const questions = _.reduce(b.questions, (questions, q) => {
        if (q.deleted) { return }
        if (q.type === 'PageBreak') {
          if (questions.length) {
            pages[b.id] = pages[b.id].concat([{ questions, blockId: b.id }])
          }
          return []
        }

        if (q.display_logic) {
          if (questions.length > 0) {
            pages[b.id] = pages[b.id].concat([{ questions, blockId: b.id }])
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

          pages[b.id] = pages[b.id].concat([attrs])
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

        pages[b.id] = pages[b.id].concat(attrs)
      }
      if (b.props && b.props.randomization) {
        pages[b.id] = RandomizeBlockQuestions.run(b.props.randomization, pages[b.id], seed)
      }
      return { ...pages }
    }, {})
  },
}

export default InitPages
