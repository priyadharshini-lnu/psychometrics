import RandomizeBlockQuestions from 'libs/survey/core/preview/FlowProcessor/commands/RandomizeBlockQuestions'

test('randomizeBlockQuestions should return valid resuls', () => {
  const pages = [
    { questions: [1, 2, 3] },
    { questions: [4, 5] },
  ]

  expect(RandomizeBlockQuestions.run(undefined, pages, 'test')).toStrictEqual(pages)
  expect(RandomizeBlockQuestions.run({ type: 'No' }, pages, 'test')).toStrictEqual(pages)
  expect(RandomizeBlockQuestions.run({ type: 'All' }, pages, 'test')).toStrictEqual([{ questions: [5, 3, 1] }, { questions: [4, 2] }])
  expect(RandomizeBlockQuestions.run({ type: 'Some', questions: 2 }, pages, 'test')).toStrictEqual([{ questions: [5, 3] }])
  expect(RandomizeBlockQuestions.run({ type: 'Some', questions: 4 }, pages, 'test')).toStrictEqual([{ questions: [5, 3, 1] }, { questions: [4] }])
})
