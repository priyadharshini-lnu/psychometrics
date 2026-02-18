# frozen_string_literal: true

require 'rails_helper'

describe AI::ContentAnalysis::SaveAIFactorScores do
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:users_result) { user_assessment.users_result }
  let(:question1) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }
  let(:question2) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }

  let(:factor1) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
  let(:factor2) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
  let(:parent_factor) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_average) }

  before do
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor1, weight: 1)
    create(:factors_sub_factor, factor: parent_factor, sub_factor: factor2, weight: 1)
    create(:factors_scoring, factor: factor1, question: question1)
    create(:factors_scoring, factor: factor2, question: question2)
    allow(UserAssessments::PostScoringTasks).to receive(:call!)
  end

  describe '#call' do
    context 'when sessions exist' do
      before do
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               checkpoint: {
                 factor1.id.to_s => {
                   'score' => 4.0,
                   'confidence' => 0.85,
                   'citations' => ['Good example'],
                   'rationale' => 'Strong performance'
                 }
               })

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               checkpoint: {
                 factor2.id.to_s => {
                   'score' => 3.0,
                   'confidence' => 0.75,
                   'citations' => ['Adequate example'],
                   'rationale' => 'Meets expectations'
                 }
               })
      end

      it 'creates AI factor scores for child factors' do
        expect { described_class.call!(users_result) }.to change(AI::FactorScore, :count).by(5)

        child_score1 = AI::FactorScore.find_by(
          users_result: users_result,
          factor_id: factor1.id,
          question_id: question1.id
        )
        expect(child_score1.score).to eq(4.0)
        expect(child_score1.confidence).to eq(0.85)
        expect(child_score1.citations).to eq(['Good example'])
        expect(child_score1.rationale).to eq('Strong performance')
        expect(child_score1.parent_factor_id).to eq(parent_factor.id)
        expect(child_score1).to be_scoring_type_ai

        child_score2 = AI::FactorScore.find_by(
          users_result: users_result,
          factor_id: factor2.id,
          question_id: question2.id
        )
        expect(child_score2.score).to eq(3.0)
        expect(child_score2.parent_factor_id).to eq(parent_factor.id)
        expect(child_score2).to be_scoring_type_ai
      end

      it 'creates aggregated scores for parent factors with nil parent_factor_id' do
        described_class.call!(users_result)

        parent_score = AI::FactorScore.find_by(
          users_result: users_result,
          factor_id: parent_factor.id,
          question_id: nil
        )
        expect(parent_score).to be_present
        expect(parent_score.score).to eq(3.5) # Average of 4.0 and 3.0
        expect(parent_score.confidence).to be_nil
        expect(parent_score.citations).to be_nil
        expect(parent_score.parent_factor_id).to be_nil
        expect(parent_score).to be_scoring_type_aggregated
      end
    end

    context 'with sub_factor_questions and sub_factor_questions_sum strategies' do
      let(:parent_avg) { create(:factor, dimension: dimension, scoring_strategy: :sub_factor_questions) }
      let(:parent_sum) { create(:factor, dimension: dimension, scoring_strategy: :sub_factor_questions_sum) }

      before do
        create(:factors_sub_factor, factor: parent_avg, sub_factor: factor1, weight: 1)
        create(:factors_sub_factor, factor: parent_avg, sub_factor: factor2, weight: 1)
        create(:factors_sub_factor, factor: parent_sum, sub_factor: factor1, weight: 1)
        create(:factors_sub_factor, factor: parent_sum, sub_factor: factor2, weight: 1)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               checkpoint: { factor1.id.to_s => { 'score' => 4.0 } })

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               checkpoint: { factor2.id.to_s => { 'score' => 2.0 } })
      end

      it 'calculates sub_factor_questions (averaging all questions of sub-factors)' do
        described_class.call!(users_result)

        avg_record = AI::FactorScore.find_by(factor: parent_avg, question_id: nil)
        expect(avg_record.score).to eq(3.0) # (4.0 + 2.0) / 2
      end

      it 'calculates sub_factor_questions_sum (summing all questions of sub-factors)' do
        described_class.call!(users_result)

        sum_record = AI::FactorScore.find_by(factor: parent_sum, question_id: nil)
        expect(sum_record.score).to eq(6.0) # 4.0 + 2.0
      end
    end

    context 'with sub_factors_sum and weights' do
      let(:factor_weighted_sum) { create(:factor, dimension: dimension, scoring_strategy: :sub_factors_sum) }

      before do
        # Setup: weighted_sum = (f1 * 2) + (f2 * 3)
        create(:factors_sub_factor, factor: factor_weighted_sum, sub_factor: factor1, weight: 2)
        create(:factors_sub_factor, factor: factor_weighted_sum, sub_factor: factor2, weight: 3)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               checkpoint: { factor1.id.to_s => { 'score' => 4.0 } })

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               checkpoint: { factor2.id.to_s => { 'score' => 2.0 } })
      end

      it 'calculates weighted sum correctly' do
        described_class.call!(users_result)

        sum_record = AI::FactorScore.find_by(factor: factor_weighted_sum, question_id: nil)
        # (4.0 * 2) + (2.0 * 3) = 8 + 6 = 14
        expect(sum_record.score).to eq(14.0)
      end
    end

    context 'when approval flow is enabled' do
      before do
        allow(user_assessment).to receive(:has_ai_scoring_approval_flow?).and_return(true)
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               checkpoint: { factor1.id.to_s => { 'score' => 4.0 } })
      end

      it 'sets initial status to pending' do
        described_class.call!(users_result)

        score_record = AI::FactorScore.find_by(factor: factor1, question_id: question1.id)
        expect(score_record.status).to eq('pending')
      end

      it 'does not call MergeAIScores' do
        expect(UsersResults::Scoring::MergeAIScores).not_to receive(:call)

        described_class.call!(users_result)
      end

      it 'does not auto approve scoring' do
        expect(user_assessment).not_to receive(:auto_approve_scoring!)

        described_class.call!(users_result)
      end
    end

    context 'when approval flow is not enabled' do
      before do
        allow(user_assessment).to receive(:has_ai_scoring_approval_flow?).and_return(false)
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               checkpoint: { factor1.id.to_s => { 'score' => 4.0 } })
      end

      it 'calls MergeAIScores after saving' do
        expect(UsersResults::Scoring::MergeAIScores).to receive(:call).with(users_result, rescore: true)

        described_class.call!(users_result, rescore: true)
      end

      it 'auto approves scoring' do
        expect(user_assessment).to receive(:auto_approve_scoring!)

        described_class.call!(users_result)
      end
    end

    context 'when no sessions exist' do
      it 'returns ok without creating scores' do
        expect { described_class.call!(users_result) }.not_to change(AI::FactorScore, :count)
      end
    end

    context 'when factor has no parent (independent factor)' do
      let(:independent_factor) { create(:factor, dimension: dimension, scoring_strategy: :questions) }
      let(:question3) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }

      before do
        create(:factors_scoring, factor: independent_factor, question: question3)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question3,
               user_assessment: user_assessment,
               checkpoint: { independent_factor.id.to_s => { 'score' => 4.5 } })
      end

      it 'creates both child and aggregated scores with nil parent_factor_id' do
        expect { described_class.call!(users_result) }.to change(AI::FactorScore, :count).by(2)

        child_score = AI::FactorScore.find_by(
          users_result: users_result,
          factor_id: independent_factor.id,
          question_id: question3.id
        )
        expect(child_score).to be_present
        expect(child_score.score).to eq(4.5)
        expect(child_score.parent_factor_id).to be_nil
        expect(child_score).to be_scoring_type_ai

        aggregated_score = AI::FactorScore.find_by(
          users_result: users_result,
          factor_id: independent_factor.id,
          question_id: nil
        )
        expect(aggregated_score).to be_present
        expect(aggregated_score.score).to eq(4.5)
        expect(aggregated_score.parent_factor_id).to be_nil
        expect(aggregated_score).to be_scoring_type_aggregated
      end
    end

    context 'when an exception occurs' do
      it 'notifies admin job of failure' do
        admin_job = create(:admin_job_record)
        allow(AI::QuestionScoringSession).to receive(:where).and_raise(StandardError, 'Something went wrong')

        expect(AdminJobRecord).to receive(:find_by).with(id: admin_job.id).and_return(admin_job)
        expect(admin_job).to receive(:fail!)

        described_class.call(users_result, rescore: false, admin_job_record_id: admin_job.id)
      end
    end
  end
end
