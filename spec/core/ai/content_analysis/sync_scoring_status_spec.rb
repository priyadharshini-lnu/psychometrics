# frozen_string_literal: true

require 'rails_helper'

describe AI::ContentAnalysis::SyncScoringStatus do
  let(:dimension) { create(:dimension) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:users_result) { user_assessment.users_result }

  let(:factor) { create(:factor, dimension: dimension) }
  let(:question1) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }
  let(:question2) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }
  let(:question3) { create(:question, assessment: assessment, props: { 'scoreWithAIEnabled' => 'true' }) }

  before do
    [question1, question2, question3].each do |q|
      create(:factors_scoring, question: q, factor: factor, assessment: assessment)
    end
    users_result.update!(ai_scoring_status: :processing)
    allow(UserAssessments::PostScoringTasks).to receive(:call!)
  end

  describe '#call' do
    context 'when all sessions are completed' do
      before do
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question3,
               user_assessment: user_assessment,
               status: :completed)
      end

      it 'updates status to completed' do
        described_class.call!(users_result)

        expect(users_result.reload.ai_scoring_status).to eq('completed')
      end

      it 'calls SaveAIFactorScores' do
        expect(AI::ContentAnalysis::SaveAIFactorScores).to receive(:call).with(users_result, rescore: false,
admin_job_record_id: nil)

        described_class.call!(users_result)
      end

      it 'broadcasts ok with completed status' do
        result = described_class.call!(users_result)

        expect(result).to eq(:completed)
      end
    end

    context 'when some sessions are still pending' do
      before do
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               status: :default)
      end

      it 'keeps status as processing' do
        described_class.call!(users_result)

        expect(users_result.reload.ai_scoring_status).to eq('processing')
      end

      it 'does not call SaveAIFactorScores' do
        expect(AI::ContentAnalysis::SaveAIFactorScores).not_to receive(:call)

        described_class.call!(users_result)
      end

      it 'broadcasts ok with processing status' do
        result = described_class.call!(users_result)

        expect(result).to eq(:processing)
      end
    end

    context 'when any session has failed' do
      before do
        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               status: :failed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question3,
               user_assessment: user_assessment,
               status: :completed)
      end

      it 'updates status to failed' do
        described_class.call!(users_result)

        expect(users_result.reload.ai_scoring_status).to eq('failed')
      end

      it 'does not call SaveAIFactorScores' do
        expect(AI::ContentAnalysis::SaveAIFactorScores).not_to receive(:call)

        described_class.call!(users_result)
      end

      it 'prioritizes failed over completed' do
        result = described_class.call!(users_result)

        expect(result).to eq(:failed)
      end
    end

    context 'when status is already up to date' do
      before do
        users_result.update!(ai_scoring_status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question1,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question2,
               user_assessment: user_assessment,
               status: :completed)

        create(:ai_question_scoring_session,
               user: users_result.user,
               question: question3,
               user_assessment: user_assessment,
               status: :completed)
      end

      it 'does not update the record' do
        expect(users_result).not_to receive(:update!)

        described_class.call!(users_result)
      end

      it 'does not call SaveAIFactorScores' do
        expect(AI::ContentAnalysis::SaveAIFactorScores).not_to receive(:call)

        described_class.call!(users_result)
      end

      it 'returns current status' do
        result = described_class.call!(users_result)

        expect(result).to eq(:completed)
      end
    end
  end
end
