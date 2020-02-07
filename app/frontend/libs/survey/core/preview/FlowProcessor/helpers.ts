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
          allPages[b.id].push({questions, blockId: b.id})
        }
        questions = []
        return
      }

      if (q.display_logic) {
        if (questions.length > 0) {
          allPages[b.id].push({questions, blockId: b.id})
        }
        questions = [q.id]
      }

      if (q.skip_logic && q.skip_logic.length) {
        if (!_.includes(questions, q.id)) {
          questions.push(q.id)
        }
        const attrs = {
          questions, blockId: b.id, skipLogic: q.skip_logic,
        }

        allPages[b.id].push(attrs)
        questions = []
        return
      }
      if (!_.includes(questions, q.id)) {
        questions.push(q.id)
      }
    })
    if (questions.length) {
      const attrs = {
        questions, blockId: b.id
      }

      allPages[b.id].push(attrs)
    }
  })
  return allPages
}

export const initLinearElements = (blocks) => {
  return _.map(blocks, (b) => ({type: 'Block', props: {current: b.id}, elements: []}))
}

/*
  Normalize flow tree to list
  input [{element: {children: [{...element}]}}]
  result {'0': element, '0/0': element}
*/

export const normalizeTree = (roots) => {
  const list = {}

  const eachChild = (child, path) => {
    if (child.elements && child.elements.length) {
      _.each(child.elements, (child, i) => eachChild(child, `${path}/${i}`))
    }
    const item = { ...child }
    delete item.elements
    list[path] = item
  }
  _.each(roots, (child, i) => eachChild(child, `${i}`))
  return list
}

export const nextElementId = (id:string):string => {
  const path:string[] = id.split('/')
  path[path.length - 1] = (+ path[path.length - 1] + 1).toString()
  return path.join('/')
}

export const nextParentElementId = (id:string):string | null => {
  const path:string[] = id.split('/')
  path.pop()
  if(path.length) {
    path[path.length - 1] = (+ path[path.length - 1] + 1).toString()
    return path.join('/')
  }
  return null
}
