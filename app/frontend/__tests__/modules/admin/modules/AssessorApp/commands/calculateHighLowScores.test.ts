import { Factor, Score, Weightage } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { 
  calculateHighLowScores,
} from "~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateHighLowScores";


describe('calculateHighLowScores', () => {
  it('should correctly calculate the high and low scores for each factor', () => {
    // Arrange
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
      { factorId: 'factor3' },
    ];
    const evaluatorsData: Score[] = [
      { scores: { factor1: 5, factor2: 3, factor3: 7 } },
      { scores: { factor1: 2, factor2: 4, factor3: 6 } },
      { scores: { factor1: 1, factor2: 9, factor3: 8 } },
    ];
    const result = calculateHighLowScores(columnsData, evaluatorsData);
    expect(result).toEqual({
      factor1: { high: '5', low: '1' },
      factor2: { high: '9', low: '3' },
      factor3: { high: '8', low: '6' },
    });
  });
  it('should handle cases where all scores for a factor are null or undefined', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
    ];
    const evaluatorsData: Score[] = [
      { scores: { factor1: null, factor2: undefined } },
      { scores: { factor1: null, factor2: undefined } },
    ];
    const result = calculateHighLowScores(columnsData, evaluatorsData);
    expect(result).toEqual({
      factor1: { high: '-', low: '-' },
      factor2: { high: '-', low: '-' },
    });
  });

  it('should handle cases where the columnsData parameter is an empty array', () => {
    const columnsData: Factor[] = [];
    const evaluatorsData: Score[] = [
      { scores: { factor1: 5, factor2: 3 } },
      { scores: { factor1: 2, factor2: 4 } },
    ];
    const result = calculateHighLowScores(columnsData, evaluatorsData);
    expect(result).toEqual({});
  });

  it('should handle cases where the evaluatorsData parameter is an empty array', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
    ];
    const evaluatorsData: Score[] = [];
    const result = calculateHighLowScores(columnsData, evaluatorsData);
    expect(result).toEqual({
      factor1: { high: '-', low: '-' },
      factor2: { high: '-', low: '-' },
    });
  });

  it('should handle cases where the columnsData parameter is empty array', () => {
    const columnsData: Factor[] = [];
    const evaluatorsData: Score[] = [
      { scores: { factor1: 5, factor2: 3 } },
      { scores: { factor1: 2, factor2: 4 } },
    ];
    const result = calculateHighLowScores(columnsData, evaluatorsData);
    expect(result).toEqual({});
  });
});
