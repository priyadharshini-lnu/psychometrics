import _ from 'lodash'
import { BlocksInterface } from './interfaces'

export const initPages = (data: BlocksInterface) => {
  const { blocks } = data
  const allPages = {}

  _.map(blocks, (b) => {
    if (b.deleted) { return }
    let questions: number[] = []
    allPages[b.id] = allPages[b.id] || []

    _.each(b.questions, (q) => {
      if (q.deleted) { return }
      if (q.type === 'PageBreak') {
        if (questions.length) {
          allPages[b.id].push({questions, errors: [], blockId: b.id})
        }
        questions = []
      } else if (q.display_logic) {
        if (questions.length > 0) {
          allPages[b.id].push({questions, errors: [], blockId: b.id})
        }
        allPages[b.id].push({questions: [q.id], errors: [], blockId: b.id, displayLogic: q.display_logic})
        questions = []
      } else if (q.skip_logic && q.skip_logic.length) {
        questions.push(q.id)
        const attrs = {
          questions, block: b, skipLogic: q.skip_logic, displayLogic: q.display_logic,
        }
        allPages[b.id].push({questions, errors: [], blockId: b.id})
        questions = []
      } else {
        questions.push(q.id)
      }
    })
    if (questions.length) {
      allPages[b.id].push({questions, errors: [], blockId: b.id})
    }
  })
  return allPages
}

export const initLinearElements = (blocks) => {
  return _.map(blocks, (b) => ({type: 'Block', props: {current: b.id}, elements: []}))
}
