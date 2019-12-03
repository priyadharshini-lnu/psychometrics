import Block from 'models/Block'
import { questionsLoader } from '../question/updaters'

const createDefault = () => new Block({ name: 'Default Block', position: 0 })

export const blocksLoader = (data) => {
  const blocks = []
  const trash = []
  _.each(data, (block) => {
    const model = new Block(block)
    model.questions = questionsLoader(block.questions, model, trash)
    if (!block.deleted) {
      blocks.push(model)
    } else {
      trash.push({ type: 'Block', model })
    }
  })
  if (!blocks.length) {
    blocks.push(createDefault())
  }
  return {
    blocks,
    trash,
  }
}
