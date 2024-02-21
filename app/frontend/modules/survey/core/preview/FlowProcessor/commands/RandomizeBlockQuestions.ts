import _ from 'lodash'
import seedrandom from 'seedrandom'
import array from '~/utils/array'
import { PageInterface, Factor } from '../interfaces'

const RandomizeBlockQuestions = {
  run (
    randomization: {type: string; questions?: number, perPage?: number} | undefined,
    pages: PageInterface[],
    seed = '',
    factors: Factor[] = [],
  ): PageInterface[] {
    if (!randomization) { return pages }

    const blockId = pages[0]?.blockId

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
      case 'ByFactors': {
        if (!randomization.questions) { return pages }

        const factorQuestions: {[k:number]: number[]} = _.reduce(factors, (fq, factor) => {
          fq[factor.id] = factor.question_ids.filter(id => questionIds.includes(id))
          return fq
        }, {})
        const selectedQuestions: number[] = []
        const result: {[k:number]: number[]} = {}

        _.times(randomization.questions, () => {
          factors.forEach((factor) => {
            const fquestions = factorQuestions[factor.id]
            const shuffledIds = array.shuffle(fquestions, seedrandom(seed))
            let id: number | undefined

            do {
              id = shuffledIds.shift()
            } while (id && selectedQuestions.includes(id))
            if (!id) { return }
            selectedQuestions.push(id)
            factorQuestions[factor.id] = fquestions.filter(q => q !== id)
            result[factor.id] ||= []
            result[factor.id].push(id)
          })
        })

        const resPages:PageInterface[] = []
        const perPage = randomization.perPage || 1

        let page: {blockId: number, questions: number[]} = { blockId, questions: [] }

        const shuffledQuestions: number[] = array.shuffle(_.flatten(_.map(result, q => q)), seedrandom(seed))

        _.each(shuffledQuestions, (qId) => {
          page.questions.push(qId)

          if (page.questions.length >= perPage) {
            resPages.push(page)
            page = { blockId, questions: [] }
          }
        })

        if (page.questions.length > 0 && page.questions.length < perPage) {
          resPages.push(page)
        }

        return resPages
      }
      default:
        return pages
    }
  },
}

export default RandomizeBlockQuestions
