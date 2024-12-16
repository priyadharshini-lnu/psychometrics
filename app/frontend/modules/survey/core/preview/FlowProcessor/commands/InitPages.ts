import _ from 'lodash'
import { BlocksInterface, PageInterface, AssessmentOptions } from '../interfaces'
import RandomizeBlockQuestions from './RandomizeBlockQuestions'
import page from 'modules/reports/core/builder/page'

const InitPages = {
  run (data: BlocksInterface, seed = '', options: AssessmentOptions = {}): {[key: number]: PageInterface[]} {
    const { blocks } = data
    return _.reduce(blocks, (pages, b) => {
      console.log('++++ reduce: pages, b, blocks ++++', pages, b, blocks)
      if (b.deleted) { return pages }
      const symbolId = Symbol.for(b.id.toString())
      pages = { ...pages, [symbolId]: [] }

      const dummyPages: any[] = [];
      // pages[symbolId]= [...pages[symbolId], { QUES_CHUNK, blockId: b.id }]
      if (b.props?.randomization.type === "QuestionsPerPage") {
        const ques = _.reduce(b.questions, (questions: number[], q) => {
          console.log("****** questions & q ******", questions, q)
          if (q.type !== 'PageBreak') {
            questions = [...questions, q.id]
            if (questions.length === b.props?.randomization.questions) {
              console.log("====== length equals n ======", questions)
              dummyPages.push({ questions, blockId: b.id })
              return []
            }
            return questions
          }
           else {
            return questions
          }
          
        }, [])
        // push 
        dummyPages.push({ questions : ques, blockId: b.id })
        console.log("****** final ques ******", ques, dummyPages)


      }
      
      const questions = _.reduce(b.questions, (questions: number[], q) => {
        // console.log("---- questions & q ----", questions, q)
        
        if (q.deleted) { return questions }

        if (q.type === 'PageBreak') {
          if (questions.length) {
            pages[symbolId] = [...pages[symbolId], { questions, blockId: b.id }]
            // console.log('*** pages[symbolId] ***', pages[symbolId])
          }
          return []
        }

        // if type is QuestionsPerPage
        // 

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

      // console.log("====== QUESTIONS ======", questions)
      
      if (b.props?.randomization.type === 'QuestionsPerPage') {
        console.log('---- inside qpp 1 ---')
        const ques = b.props.randomization?.questions
        if (questions.length) {
          const questionChunks = _.chunk(questions, ques) // [[],[]]
          pages[symbolId] = []
          questionChunks.forEach((chunk) => {
            pages[symbolId] = [
              ...pages[symbolId],
              { questions: chunk, blockId: b.id },
            ]
          })
        }
      }

      if (questions.length && b.props?.randomization.type !== 'QuestionsPerPage') {
        console.log('---- inside qpp 2 ---')
        const attrs = {
          questions,
          blockId: b.id,
        }
        pages[symbolId] = [...pages[symbolId], attrs]
      }
      // REVIEW: delink with randomization
      if (b.props && b.props.randomization) {
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
