import _ from 'lodash'
import { BlocksInterface } from './interfaces'
import seedrandom from 'seedrandom'

export const initPages = (data: BlocksInterface, seed:string = '') => {
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
    if (b.props && b.props.randomization) {
      allPages[b.id] = randomizeBlockQuestions(b.props.randomization, allPages[b.id], seed)
    }
  })
  return allPages
}

export const randomizeBlockQuestions = (randomization:{type:string, questions?:number} | undefined, pages, seed = '') => {
  if (!randomization) { return pages }

  const randomize = (unordered) => {
    const newPages = _.cloneDeep(pages)
    _.each(newPages, (p) => {
      p.questions = _.take(unordered, p.questions.length)
      unordered = _.drop(unordered, p.questions.length)
    })
    return newPages
  }

  switch(randomization.type) {
    case 'All':{
      const questions = _.flatten(pages.map(p => p.questions))
      return randomize(shuffle(questions, seedrandom(seed)))
    }
    case 'Some': {
      const questions = _.flatten(pages.map(p => p.questions))
      const unordered = _.take(shuffle(questions, seedrandom(seed)), randomization.questions)
      const newPages = randomize(unordered)
      _.remove(newPages, (p:{questions}) => !p.questions.length)
      return newPages
    }
    default:
      return pages
  }
}

export const initLinearElements = (blocks) => {
  return _.map(blocks, (b) => ({type: 'Block', props: {current: `${b.id}`}, elements: []}))
}

/*
  Normalize flow tree to list
  input [{element: {children: [{...element}]}}]
  result {'0': element, '0/0': element ...}
*/

export const normalizeTree = (roots, seed = '') => {
  const list = {}

  const eachChild = (child, path, randomize:any = null) => {
    if (child.elements && child.elements.length) {
      let elements = child.elements
      if (randomize) {
        elements = _.take(shuffle(elements, seedrandom(seed)), randomize.count)
      }
      _.each(elements, (child, i) => eachChild(child, `${path}/${i}`, child.type === 'Randomizer' ? {count: child.props.number} : null))
    }
    const item = { ...child }
    delete item.elements
    list[path] = item
  }
  _.each(roots, (child, i) => eachChild(child, `${i}`, child.type === 'Randomizer' ? {count: child.props.number} : null))
  return list
}

export const nextElementId = (id:string):string => {
  if (!id) { return '0' }
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

// override lodash shuffle to use seedrandom instead Math.random
// https://github.com/lodash/lodash/blob/master/shuffle.js
export const shuffle = (array, rnd) => {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = _.clone(array)
  while (++index < length) {
    const rand = index + Math.floor(rnd() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}

export const randomSequesnce = (count, rnd) => {
  return _.times(count, () => rnd())
}

export const randomInt = (a:number, b:number, rnd) => {
  return Math.round(a + rnd()*(b - a))
}
