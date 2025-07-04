import { Factor, Score, Weightage } from '~/modules/admin/modules/campaigns/core/combinedScoring'
import { 
  calculateWeightedAverageScores,
} from "~/modules/admin/modules/AssessorApp/routes/ModerateScoring/ScoringTable/commands/calculateWeightedAverageScores";

describe('Test calculateWeightedAverageScores', () => {
  it('should return an empty object when FactorWeightagesData is empty', () => {
    const columnsData: Factor[] = [];
    const evaluatorsData: Score[] = [];
    const FactorWeightagesData: Weightage[] = [];

    const result = calculateWeightedAverageScores(columnsData, evaluatorsData, FactorWeightagesData);

    expect(result).toEqual({});
  });

  it('should return an empty object when columnsData is empty', () => {
    const columnsData: Factor[] = [];
    const evaluatorsData: Score[] = [
      { scores: { factor1: 5, factor2: 7 }, assessment: { id: 'assessment1' } },
      { scores: { factor1: 8, factor2: 6 }, assessment: { id: 'assessment2' } },
    ];
    const FactorWeightagesData: Weightage[] = [
      { factor: { id: 'factor1' }, assessment: { id: 'assessment1' }, weight: 0.5 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment1' }, weight: 0.3 },
      { factor: { id: 'factor1' }, assessment: { id: 'assessment2' }, weight: 0.2 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment2' }, weight: 0.4 },
    ];

    const result = calculateWeightedAverageScores(columnsData, evaluatorsData, FactorWeightagesData);

    expect(result).toEqual({});
  });
  it('should return an empty object when evaluatorsData is empty', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
    ];
    const evaluatorsData: Score[] = [];
    const FactorWeightagesData: Weightage[] = [
      { factor: { id: 'factor1' }, assessment: { id: 'assessment1' }, weight: 0.5 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment1' }, weight: 0.3 },
      { factor: { id: 'factor1' }, assessment: { id: 'assessment2' }, weight: 0.2 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment2' }, weight: 0.4 },
    ];

    const result = calculateWeightedAverageScores(columnsData, evaluatorsData, FactorWeightagesData);

    expect(result).toEqual({});
  });

  it('should calculate the weighted average score for each factor', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
    ];
    const evaluatorsData: Score[] = [
      { scores: { factor1: 5, factor2: 7 }, assessment: { id: 'assessment1' } },
      { scores: { factor1: 8, factor2: 6 }, assessment: { id: 'assessment2' } },
    ];
    const FactorWeightagesData: Weightage[] = [
      { factor: { id: 'factor1' }, assessment: { id: 'assessment1' }, weight: 0.5 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment1' }, weight: 0.3 },
      { factor: { id: 'factor1' }, assessment: { id: 'assessment2' }, weight: 0.2 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment2' }, weight: 0.4 },
    ];

    const result = calculateWeightedAverageScores(columnsData, evaluatorsData, FactorWeightagesData);

    expect(result).toEqual({ factor1: '2.05', factor2: '2.25' });
  });

  it('should handle null and undefined scores', () => {
    const columnsData: Factor[] = [
      { factorId: 'factor1' },
      { factorId: 'factor2' },
    ];
    const evaluatorsData: Score[] = [
      { scores: { factor1: null, factor2: 7 }, assessment: { id: 'assessment1' } },
      { scores: { factor1: undefined, factor2: 6 }, assessment: { id: 'assessment2' } },
    ];
    const FactorWeightagesData: Weightage[] = [
      { factor: { id: 'factor1' }, assessment: { id: 'assessment1' }, weight: 0.5 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment1' }, weight: 0.3 },
      { factor: { id: 'factor1' }, assessment: { id: 'assessment2' }, weight: 0.2 },
      { factor: { id: 'factor2' }, assessment: { id: 'assessment2' }, weight: 0.4 },
    ];

    const result = calculateWeightedAverageScores(columnsData, evaluatorsData, FactorWeightagesData);

    expect(result).toEqual({ factor1: '-', factor2: '2.25' });
  });
});