import _ from 'lodash'
import seedrandom from 'seedrandom'
import array from '~/utils/array'
import { PageInterface } from '../interfaces'

const RandomizeBlockQuestions = {
  run (
    randomization: {type: string; questions?: number} | undefined,
    pages: PageInterface[],
    seed = '',
  ): PageInterface[] {
    if (!randomization) { return pages }

    const randomize = unordered => pages.reduce((res, page) => {
      if (!unordered.length) return res
      const p = { ...page, questions: _.take(unordered, page.questions.length) }
      unordered = _.drop(unordered, page.questions.length)
      return [...res, p]
    }, []) as PageInterface[]

    const questionIds = _.flatten(pages.map(p => p.questions))
    const shuffledQuestionIds = array.shuffle(questionIds, seedrandom(seed))

    switch (randomization.type) {
      case 'All':
        return randomize(shuffledQuestionIds)
      case 'Some':
        return randomize(_.take(shuffledQuestionIds, randomization.questions))
      default:
        return pages
    }
  },
}

export default RandomizeBlockQuestions
