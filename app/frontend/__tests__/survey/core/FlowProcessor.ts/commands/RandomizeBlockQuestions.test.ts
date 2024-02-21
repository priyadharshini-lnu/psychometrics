import RandomizeBlockQuestions from '~/modules/survey/core/preview/FlowProcessor/commands/RandomizeBlockQuestions'

test('randomizeBlockQuestions should return valid resuls', () => {
  const pages = [
    { questions: [1, 2, 3], blockId: 1 },
    { questions: [4, 5], blockId: 1 },
  ]

  expect(RandomizeBlockQuestions.run(undefined, pages, 'test')).toStrictEqual(pages)
  expect(RandomizeBlockQuestions.run({ type: 'No' }, pages, 'test')).toStrictEqual(pages)
  expect(RandomizeBlockQuestions.run({ type: 'All' }, pages, 'test')).toStrictEqual([{ questions: [5, 3, 1] , blockId: 1}, { questions: [4, 2] , blockId: 1}])
  expect(RandomizeBlockQuestions.run({ type: 'Some', questions: 2 }, pages, 'test')).toStrictEqual([{ questions: [5, 3] , blockId: 1}])
  expect(RandomizeBlockQuestions.run({ type: 'Some', questions: 4 }, pages, 'test')).toStrictEqual([{ questions: [5, 3, 1] , blockId: 1}, { questions: [4] , blockId: 1}])
})

test('randomizeBlockQuestions by Factors', () => {
  const factors = [{
    id: 1,
    question_ids: [1, 2]
  }, {
    id: 2,
    question_ids: [3, 4]
  }]

  const pages = [{blockId: 1, questions: [1,2,3,4]}]

  expect(RandomizeBlockQuestions.run({type: 'ByFactors', questions: 2, perPage: 2}, pages, 'test', factors)).toStrictEqual([{
    blockId: 1, questions: [3, 4]
  }, {
    blockId: 1, questions: [2, 1]
  }])
})


test('randomizeBlockQuestions by Factors with empty score', () => {
  const factors = [{
    id: 1,
    question_ids: [1, 2]
  }, {
    id: 2,
    question_ids: []
  }]
  const pages = [{blockId: 1, questions: [1,2,3,4]}]

  expect(RandomizeBlockQuestions.run({type: 'ByFactors', questions: 2, perPage: 2}, pages, 'test', factors)).toStrictEqual([{
    blockId: 1, questions: [1, 2]
  }])
})


test('randomizeBlockQuestions by Factors with crossing questions', () => {
  const factors = [{
    id: 1,
    question_ids: [1, 2]
  }, {
    id: 2,
    question_ids: [2, 3]
  },{
    id: 3,
    question_ids: [3, 2, 1, 4]
  }]
  const pages = [{blockId: 1, questions: [3,2,1,4]}]

  expect(RandomizeBlockQuestions.run({type: 'ByFactors', questions: 3, perPage: 3}, pages, 'test4', factors)).toStrictEqual([{
    blockId: 1, questions: [2,3,4]
  }, {
    blockId: 1, questions: [1]
  }])
})
