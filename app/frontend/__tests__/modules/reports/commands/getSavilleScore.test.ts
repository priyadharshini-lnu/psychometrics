import { getSavilleFactorsScore } from 'modules/reports/commands/getSavilleFactorsScore'

test('return empty array if there are no saville factor relation to particular score', () => {
  const result = getSavilleFactorsScore({
    scores: [{
      id: 'Id1',
      score_type: 'Nipsitive',
      value_type: 'sten',
      score: 1
    }],
    scoreType: 'Nipsitive',
    valueType: 'sten',
    scoreForFactorIds: ['Id2'],
    assessmentId: 1,
    allFactors: [{ id: 'Id1', name: 'Id1_Factor', score_types: [{ Nipsitive: ['sten'] }]}]
  })

  expect(result).toEqual([])
})

test('return scores for passed factorIds', () => {
  const result = getSavilleFactorsScore({
    scores: [
      { id: 'Id1', score_type: 'Nipsitive', value_type: 'sten', score: 1 },
      { id: 'Id2', score_type: 'Nipsitive', value_type: 'sten', score: 2 },
      { id: 'Id3', score_type: 'Nipsitive', value_type: 'sten', score: 3 }
    ],
    scoreType: 'Nipsitive',
    valueType: 'sten',
    scoreForFactorIds: ['Id1', 'Id2'],
    assessmentId: 1,
    allFactors: [
      { id: 'Id1', name: 'Id1_Factor', score_types: [{ Nipsitive: ['sten'] }] },
      { id: 'Id2', name: 'Id2_Factor', score_types: [{ Nipsitive: ['sten'] }] },
      { id: 'Id3', name: 'Id3_Factor', score_types: [{ Nipsitive: ['sten'] }] },
    ]
  })

  expect(result).toEqual([
    { name: 'Id1_Factor', score: 1 },
    { name: 'Id2_Factor', score: 2 },
  ])
})

test('handles the case where saville factor is not present for the score', () => {
  const result = getSavilleFactorsScore({
    scores: [
      { id: 'Id1', score_type: 'Nipsitive', value_type: 'sten', score: 1 },
      { id: 'Id2', score_type: 'Nipsitive', value_type: 'sten', score: 2 },
    ],
    scoreType: 'Nipsitive',
    valueType: 'sten',
    scoreForFactorIds: ['Id1', 'Id2'],
    assessmentId: 1,
    allFactors: [
      { id: 'Id1', name: 'Id1_Factor', score_types: [{ Nipsitive: ['sten'] }] },
    ]
  })

  expect(result).toEqual([
    { name: 'Id1_Factor', score: 1 },
  ])
})

test('handles the case where scores for passed factorId is not present', () => {
  const result = getSavilleFactorsScore({
    scores: [
      { id: 'Id1', score_type: 'Nipsitive', value_type: 'sten', score: 1 },
    ],
    scoreType: 'Nipsitive',
    valueType: 'sten',
    scoreForFactorIds: ['Id1', 'Id2'],
    assessmentId: 1,
    allFactors: [
      { id: 'Id1', name: 'Id1_Factor', score_types: [{ Nipsitive: ['sten'] }] },
      { id: 'Id2', name: 'Id2_Factor', score_types: [{ Nipsitive: ['sten'] }] },
    ]
  })

  expect(result).toEqual([
    { name: 'Id1_Factor', score: 1 },
  ])
})
