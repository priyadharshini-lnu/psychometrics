import middleware from 'libs/survey/core/preview/FlowProcessor/middleware'
import { createStore } from 'redux'
import reducers from 'libs/survey/core/rootReducers'
import {
  NEXT_PAGE, showErrors, emptyErrors, showPage, changeElement, showEnd, saveResults, hideQuestion, INIT, ANSWER,
} from 'libs/survey/core/preview/FlowProcessor/actions'
import {pageQuestions, pageQuestionsWithoutHidden} from 'libs/survey/core/preview/FlowProcessor/selectors'
import assessment from './seeds/assessment'
import assessmentWithDisplayLogic from './seeds/assessmentWithDisplayLogic'

describe('initializing base assessment', () => {
  const store = createStore(reducers)

  test('middleware should call next if is not NEXT_PAGE', () => {
    const flow = middleware(store)
    const next = jest.fn()
    flow(next)({})

    expect(next.mock.calls.length).toBe(1)
    expect(store.getState().preview).toStrictEqual({
      initialized: false,
      type: 'preview',
      elements: [],
      blocks: {},
      questions: {},
      questionsQueue: [],
      embeddedData: {},
      pages: [],
      allPages: {},
      results: {},
      currentPage: 0,
      errors: null,
      end: false,
    })
  });


  test('init action should init assessment data', () => {
    store.dispatch({type: INIT, data: assessment})
    expect(store.getState()).toMatchSnapshot('init_assessment')
  });

  test('trigger next page up to end', () => {
    const flow = middleware(store)
    const next = jest.fn()
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/0')
    expect(store.getState().preview.embeddedData).toStrictEqual({test: '1'})
    flow(next)({ type: NEXT_PAGE })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/1')
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.end).toBe(true)
  });
})



describe('assessment with display logic', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({type: INIT, data: assessmentWithDisplayLogic})

  test('should contains 3 pages', () => {
    const {preview} = store.getState()
    expect(preview.allPages[1].length).toBe(2)
    expect(preview.allPages[2].length).toBe(1)
  })

  test('next page should trigger display logic processor and mark question as hidden', () => {
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
    const questions = pageQuestions(store.getState().preview)
    expect(questions[0].hidden).toBe(true)
    expect(pageQuestionsWithoutHidden(store.getState().preview).length).toBe(0)
  })


  test('next page should trigger display logic processor', () => {
    store.dispatch({type: ANSWER, result: {question_id: 1, answers: [{index:0, value: true}], not_applicable: null}})
    expect(store.getState().preview.results).toStrictEqual({1: {question_id: 1, answers: [{index:0, value: true}], not_applicable: null}})
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('1')
  })

})
