import _ from 'lodash'
import shuffle from 'utils/shuffle'
import seedrandom from 'seedrandom'

const RandomizeBlockQuestions = {
  run (
    randomization: {type: string; questions?: number} | undefined,
    pages,
    seed = '',
  ) {
    if (!randomization) { return pages }

    const randomize = unordered => pages.reduce((res, page) => {
      if (!unordered.length) return res
      const p = { ...page, questions: _.take(unordered, page.questions.length) }
      unordered = _.drop(unordered, page.questions.length)
      return [...res, p]
    }, [])
    const questionIds = _.flatten(pages.map(p => p.questions))
    const shuffledQuestionIds = shuffle(questionIds, seedrandom(seed))

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
