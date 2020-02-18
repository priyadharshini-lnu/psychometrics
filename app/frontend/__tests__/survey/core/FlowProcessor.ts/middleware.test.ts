import _ from 'lodash'
import middleware from 'libs/survey/core/preview/FlowProcessor/middleware'
import { createStore } from 'redux'
import reducers from 'libs/survey/core/rootReducers'
import {
  INIT, NEXT_PAGE, ANSWER,
} from 'libs/survey/core/preview/FlowProcessor/consts'

import { pageQuestions, pageQuestionsWithoutHidden } from 'libs/survey/core/preview/FlowProcessor/selectors'
import assessment from './seeds/assessment'
import assessmentWithDisplayLogic from './seeds/assessmentWithDisplayLogic'
import assessmentWithSkipLogic from './seeds/assessmentWithSkipLogic'

describe('initializing base assessment', () => {
  const store = createStore(reducers)

  test('middleware should call next if is not NEXT_PAGE', () => {
    const flow = middleware(store)
    const next = jest.fn()
    flow(next)({})
    expect(next.mock.calls.length).toBe(1)
    expect(store.getState()).toMatchSnapshot('default_store')
  })


  test('init action should init assessment data', () => {
    store.dispatch({ type: INIT, data: assessment, result: {} })
    expect(store.getState()).toMatchSnapshot('init_assessment')
  })

  test('trigger next page up to end', () => {
    const flow = middleware(store)
    const next = jest.fn()
    flow(next)({ type: NEXT_PAGE }) // initial from saga
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/0')
    expect(store.getState().preview.embeddedData).toStrictEqual({ test: '1' })
    flow(next)({ type: NEXT_PAGE })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/1')
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.end).toBe(true)
  })
})


describe('initializing base assessment from not the first step', () => {
  const store = createStore(reducers)

  test('init action should init assessment from element 2', () => {
    const flow = middleware(store)
    const next = jest.fn()
    store.dispatch({ type: INIT, data: assessment, result: { current_element: '2/0', current_page: 0, results: { 1: { answers: [{ index: 0, value: true }] } } } })
    expect(store.getState().preview.currentElement).toBe('2/0')
    expect(store.getState().preview.currentPage).toBe(0)
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/0')
    expect(store.getState().preview.currentPage).toBe(1)
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2/1')
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.end).toBe(true)
  })
})

describe('initializing base assessment from question with display logic', () => {
  const store = createStore(reducers)

  test('init action should init assessment from element 2/0 page 2 and skip it to next as it does not have questions', () => {
    const flow = middleware(store)
    const next = jest.fn()
    store.dispatch({ type: INIT, data: assessment, result: { current_element: '2/0', current_page: 1 } })
    flow(next)({ type: NEXT_PAGE, testDisplayLogic: true })
    expect(store.getState().preview.currentElement).toBe('2/1')
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.end).toBe(true)
  })
})


describe('initializing base assessment from question with display logic', () => {
  const store = createStore(reducers)

  test('init action should init assessment from element 2/0 page 2 and show only second quesion', () => {
    const flow = middleware(store)
    const next = jest.fn()
    const data = _.cloneDeep(assessment)
    data.blocks[0].questions.push({ ...data.blocks[0].questions[0], id: 4 })

    store.dispatch({ type: INIT, data, result: { current_element: '2/0', current_page: 1 } })
    flow(next)({ type: NEXT_PAGE, testDisplayLogic: true })
    expect(store.getState().preview.currentElement).toBe('2/0')
    expect(store.getState().preview.currentPage).toBe(1)
    const questions = pageQuestions(store.getState().preview)
    expect(questions[0].hidden).toBe(true)
    expect(questions[1].hidden).toBe(undefined)
    expect(questions[1].id).toBe(4)
    expect(pageQuestionsWithoutHidden(store.getState().preview).length).toBe(1)
  })
})

describe('assessment with invalid display logic should skip page without question', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  const data = _.cloneDeep(assessmentWithDisplayLogic)
  _.remove(data.blocks[0].questions, { id: 3 })
  store.dispatch({ type: INIT, data, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('should contains 3 pages', () => {
    const { preview } = store.getState()
    expect(preview.allPages[1].length).toBe(2)
    expect(preview.allPages[1][0].questions.length).toBe(1)
    expect(preview.allPages[1][1].questions.length).toBe(1)
    expect(preview.allPages[2].length).toBe(1)
  })

  test('next page should trigger display logic processor and mark question as hidden for invalid condition', () => {
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('1')
    expect(store.getState().preview.currentPage).toBe(0)
    const questions = pageQuestions(store.getState().preview)
    expect(questions[0].id).toBe(4)
  })
})


describe('assessment with invalid display logic condition', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({ type: INIT, data: assessmentWithDisplayLogic, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('should contains 3 pages', () => {
    const { preview } = store.getState()
    expect(preview.allPages[1].length).toBe(2)
    expect(preview.allPages[1][0].questions.length).toBe(1)
    expect(preview.allPages[1][1].questions.length).toBe(2)
    expect(preview.allPages[2].length).toBe(1)
  })

  test('next page should trigger display logic processor and mark question as hidden for invalid condition', () => {
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
    const questions = pageQuestions(store.getState().preview)
    expect(questions[0].hidden).toBe(true)
    expect(pageQuestionsWithoutHidden(store.getState().preview).length).toBe(1)
  })
})


describe('assessment with valid display logic condition', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({ type: INIT, data: assessmentWithDisplayLogic, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger skip logic with valid condition and current block', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })

    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
    const questions = pageQuestions(store.getState().preview)
    expect(questions[0].hidden).toBe(undefined)
    expect(pageQuestionsWithoutHidden(store.getState().preview).length).toBe(2)
  })
})


describe('assessment with valid invalid skip logic condition', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({ type: INIT, data: assessmentWithSkipLogic, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger skip logic with invalid condition and show next page', () => {
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
  })
})


describe('assessment with valid valid skip logic condition', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({ type: INIT, data: assessmentWithSkipLogic, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger skip logic with valid condition and skip block', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('1')
    expect(store.getState().preview.currentPage).toBe(0)
  })
})

describe('assessment with valid valid skip logic condition', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  store.dispatch({ type: INIT, data: assessmentWithSkipLogic, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger skip logic with invalid condition and show next page', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 1, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 1, value: true }], not_applicable: null } })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
  })
})


describe('assessment with valid valid skip logic to end of assessment condition ', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  const data = _.cloneDeep(assessmentWithSkipLogic)
  data.blocks[0].questions[0].skip_logic[0].destination = 'EndOfAssessment'
  store.dispatch({ type: INIT, data, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger display logic with valid condition and show question', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.end).toBe(true)
  })
})


describe('assessment with valid valid skip to specific block', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  const data = _.cloneDeep(assessmentWithSkipLogic)
  data.blocks[0].questions[0].skip_logic[0].destination = 'SpecificBlock'
  data.blocks[0].questions[0].skip_logic[0].destinationBlock = 3
  store.dispatch({ type: INIT, data, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger display logic with valid condition and show question', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('2')
    expect(store.getState().preview.currentPage).toBe(0)
  })
})


describe('assessment with valid valid skip to specific block not in linear should be ignored', () => {
  const store = createStore(reducers)
  const next = jest.fn()
  const flow = middleware(store)
  const data = _.cloneDeep(assessmentWithSkipLogic)
  data.flow.elements = [
    { type: 'Block', props: { current: '1' }, elements: [] },
    { type: 'Block', props: { current: '2' }, elements: [] },
    { type: 'Block', props: { current: '3' }, elements: [] },
  ]
  data.blocks[0].questions[0].skip_logic[0].destination = 'SpecificBlock'
  data.blocks[0].questions[0].skip_logic[0].destinationBlock = 3
  store.dispatch({ type: INIT, data, result: {} })
  flow(next)({ type: NEXT_PAGE }) // initial from saga

  test('next page should trigger display logic with valid condition and show question', () => {
    store.dispatch({ type: ANSWER, result: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    expect(store.getState().preview.results).toStrictEqual({ 1: { question_id: 1, answers: [{ index: 0, value: true }], not_applicable: null } })
    flow(next)({ type: NEXT_PAGE })
    expect(store.getState().preview.currentElement).toBe('0')
    expect(store.getState().preview.currentPage).toBe(1)
  })
})
