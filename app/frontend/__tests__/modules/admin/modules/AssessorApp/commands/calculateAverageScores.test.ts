import { Factor, Score, Weightage } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { 
  calculateAverageScores,
} from "~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateAverageScores";



describe('Test calculateAverageScores', () => {
  it('should calculate average scores correctly when given valid input data', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
      { factorId: 'factor3' },
    ]
    const evaluatorsData: Score[] = [
      { evaluatorId: 'evaluator1', scores: { factor1: 5, factor2: 7, factor3: 9 } },
      { evaluatorId: 'evaluator2', scores: { factor1: 8, factor2: 6, factor3: 4 } },
      { evaluatorId: 'evaluator3', scores: { factor1: 3, factor2: 2, factor3: 1 } },
    ]
    const result = calculateAverageScores(columnsData, evaluatorsData)

    expect(result).toEqual({
      factor1: '5.33',
      factor2: '5.00',
      factor3: '4.67',
    })
  });
  it('should return "-" for factors with no scores provided by evaluators', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
      { factorId: 'factor3' },
    ]
    const evaluatorsData: Score[] = [
      { evaluatorId: 'evaluator1', scores: { factor1: 5, factor2: 7 } },
      { evaluatorId: 'evaluator2', scores: { factor1: 8, factor2: 6 } },
      { evaluatorId: 'evaluator3', scores: { factor1: 3, factor2: 2 } },
    ]
    const result = calculateAverageScores(columnsData, evaluatorsData)
    expect(result).toEqual({
      factor1: '5.33',
      factor2: '5.00',
      factor3: '-',
    })
  });
    it('should handle cases where only one evaluator has provided scores for all factors', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
      { factorId: 'factor3' },
    ]
    const evaluatorsData: Score[] = [
      { evaluatorId: 'evaluator1', scores: { factor1: 5, factor2: 7, factor3: 9 } },
    ]
    const result = calculateAverageScores(columnsData, evaluatorsData)
    expect(result).toEqual({
      factor1: '5.00',
      factor2: '7.00',
      factor3: '9.00',
    })
  });
  it('should return an empty object when given empty input arrays', () => {
    const columnsData: Factor[] = []
    const evaluatorsData: Score[] = []
    const result = calculateAverageScores(columnsData, evaluatorsData)
    expect(result).toEqual({})
  });
});