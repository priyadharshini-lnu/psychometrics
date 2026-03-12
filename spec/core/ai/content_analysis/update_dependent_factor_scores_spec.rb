# frozen_string_literal: true

require 'rails_helper'

describe AI::ContentAnalysis::UpdateDependentFactorScores do
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:users_result) { user_assessment.users_result }

  let(:factor1) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
  let(:factor2) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
  let(:parent_factor) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }
  let(:question1) { create(:question, assessment: assessment) }
  let(:question2) { create(:question, assessment: assessment) }

  before do
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor1, weight: 1)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor2, weight: 1)
    create(:factors_scoring, factor: factor1, question: question1)
    create(:factors_scoring, factor: factor2, question: question2)
  end

  describe '#call' do
    context 'when updating child factor scores' do
      let!(:child_score1) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question_id: question1.id,
               score: 4.0,
               status: :auto_approved)
      end

      let!(:child_score2) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question_id: question2.id,
               score: 3.0,
               status: :auto_approved)
      end

      let!(:parent_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: parent_factor,
               question_id: nil,
               score: 3.5,
               status: :auto_approved)
      end

      it 'recalculates parent factor scores' do
        child_score1.update!(score: 5.0)

        described_class.call!([child_score1])

        parent_score.reload
        expect(parent_score.score).to eq(4.0) # Average of 5.0 and 3.0
      end

      it 'preserves existing status on parent scores' do
        child_score1.update!(score: 5.0)

        described_class.call!([child_score1])

        parent_score.reload
        expect(parent_score.status).to eq('auto_approved')
      end

      it 'handles multiple updated records' do
        child_score1.update!(score: 5.0)
        child_score2.update!(score: 4.0)

        described_class.call!([child_score1, child_score2])

        parent_score.reload
        expect(parent_score.score).to eq(4.5) # Average of 5.0 and 4.0
      end

      it 'recalculates parent factor scores even if only one child is updated' do
        child_score1.update!(score: 5.0)
        # child_score2 remains 3.0

        described_class.call!([child_score1])

        parent_score.reload
        expect(parent_score.score).to eq(4.0) # Average of 5.0 and 3.0
      end
    end

    context 'when updating factors with nested parent hierarchy' do
      let(:factor1) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
      let(:factor2) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
      let(:parent1) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }
      let(:parent2) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
      let(:grandparent) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }

      before do
        create(:factors_sub_factor, factor: parent1, sub_factor: factor1, weight: 1)
        create(:factors_sub_factor, factor: parent1, sub_factor: factor2, weight: 1)

        create(:factors_sub_factor, factor: grandparent, sub_factor: parent1, weight: 1)
        create(:factors_sub_factor, factor: grandparent, sub_factor: parent2, weight: 1)

        create(:factors_scoring, factor: factor1, question: question1)
        create(:factors_scoring, factor: factor2, question: question2)
      end

      let!(:factor1_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question_id: question1.id,
               score: 4.0,
               status: :auto_approved)
      end

      let!(:factor2_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question_id: question2.id,
               score: 2.0,
               status: :auto_approved)
      end

      let!(:parent1_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: parent1,
               question_id: nil,
               score: 3.0, # Average of factor1(4.0) and factor2(2.0)
               status: :auto_approved)
      end

      let!(:parent2_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: parent2,
               question_id: question1.id,
               score: 5.0,
               status: :auto_approved)
      end

      let!(:grandparent_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: grandparent,
               question_id: nil,
               score: 4.0, # Average of parent1(3.0) and parent2(5.0)
               status: :auto_approved)
      end

      it 'recalculates both parent and grandparent when a child factor is updated' do
        factor1_score.update!(score: 6.0)

        described_class.call!([factor1_score])

        parent1_score.reload
        grandparent_score.reload

        expect(parent1_score.score).to eq(4.0) # Average of factor1(6.0) and factor2(2.0)
        expect(grandparent_score.score).to eq(4.5) # Average of parent1(4.0) and parent2(5.0)
      end

      it 'does not update unrelated factors' do
        factor1_score.update!(score: 6.0)

        expect { described_class.call!([factor1_score]) }.
          not_to(change { factor2_score.reload.score })

        expect { described_class.call!([factor1_score]) }.
          not_to(change { parent2_score.reload.score })
      end
    end

    context 'when updating an independent factor (no parents)' do
      let(:independent_factor) { create(:factor, dimension: dimension, scoring_strategy: :questions) }

      let!(:independent_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: independent_factor,
               question_id: question1.id,
               score: 3.0,
               status: :auto_approved)
      end

      it 'updates the corresponding aggregated record' do
        independent_score.update!(score: 5.0)

        aggregated_score = create(:ai_factor_score,
                                  users_result: users_result,
                                  factor: independent_factor,
                                  question_id: nil,
                                  score: 3.0)

        described_class.call!([independent_score])

        expect(aggregated_score.reload.score).to eq(5.0)
      end
    end

    context 'when updating a factor with no parent but multiple questions (self-aggregation)' do
      let(:independent_multi_q_factor) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
      let(:question3) { create(:question, assessment: assessment) }

      before do
        create(:factors_scoring, factor: independent_multi_q_factor, question: question1)
        create(:factors_scoring, factor: independent_multi_q_factor, question: question3)
      end

      let!(:score_q1) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: independent_multi_q_factor,
               question_id: question1.id,
               score: 4.0,
               status: :auto_approved)
      end

      let!(:score_q3) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: independent_multi_q_factor,
               question_id: question3.id,
               score: 6.0,
               status: :auto_approved)
      end

      let!(:aggregated_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: independent_multi_q_factor,
               question_id: nil,
               score: 5.0, # Average of 4.0 and 6.0
               status: :auto_approved)
      end

      it 'recalculates the aggregated score when one question score is updated' do
        score_q1.update!(score: 8.0)

        described_class.call!([score_q1])

        aggregated_score.reload
        expect(aggregated_score.score).to eq(7.0) # Average of 8.0 and 6.0
      end

      it 'creates aggregated score if it does not exist' do
        aggregated_score.destroy!

        score_q1.update!(score: 8.0)
        described_class.call!([score_q1])

        new_aggregated = AI::FactorScore.find_by(
          users_result: users_result,
          factor: independent_multi_q_factor,
          question_id: nil
        )
        expect(new_aggregated).to be_present
        expect(new_aggregated.score).to eq(7.0)
      end
    end

    context 'when updating a factor with single question (still needs aggregated record)' do
      let(:single_q_factor) { create(:factor, dimension: dimension, scoring_strategy: :questions) }

      before do
        create(:factors_scoring, factor: single_q_factor, question: question1)
      end

      let!(:score_q1) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: single_q_factor,
               question_id: question1.id,
               score: 4.0,
               status: :auto_approved)
      end

      let!(:aggregated_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: single_q_factor,
               question_id: nil,
               score: 4.0,
               status: :auto_approved)
      end

      it 'updates the aggregated score to match the question score' do
        score_q1.update!(score: 7.0)

        described_class.call!([score_q1])

        aggregated_score.reload
        expect(aggregated_score.score).to eq(7.0)
      end
    end

    context 'with override_score' do
      let!(:child_score1) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor1,
               question_id: question1.id,
               score: 4.0,
               override_score: 5.0,
               status: :auto_approved)
      end

      let!(:child_score2) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: factor2,
               question_id: question2.id,
               score: 3.0,
               status: :auto_approved)
      end

      let!(:parent_score) do
        create(:ai_factor_score,
               users_result: users_result,
               factor: parent_factor,
               question_id: nil,
               score: 3.5,
               status: :auto_approved)
      end

      it 'uses override_score for parent recalculation' do
        described_class.call!([child_score1])

        parent_score.reload
        expect(parent_score.score).to eq(4.0) # Average of override 5.0 and ai 3.0
      end
    end
  end
end
