# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::SaveScores do
  let(:assessment) { create(:assessment) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:user_result) { user_assessment.users_result }
  let(:current_user) { create(:user) }

  before do
    allow(user_result).to receive(:completed?).and_return(true)
    allow(UsersResults::ExpandAnswersByRecoding).to receive(:call!).and_return({})
    allow(UsersResults::CalculateScoring).to receive(:call!).and_return({})
    allow(UsersResults::CalculateOccupations).to receive(:call!).and_return([])
    allow(UsersResults::CalculateInnovationStyles).to receive(:call!).and_return([])
  end

  describe '#call' do
    context 'when rescore is false (default)' do
      it 'calls PostScoringTasks with rescore: false' do
        expect(UserAssessments::PostScoringTasks).to receive(:call!).with(
          user_assessment,
          current_user,
          rescore: false
        )

        described_class.call!(user_assessment, current_user)
      end
    end

    context 'when rescore is true' do
      it 'calls PostScoringTasks with rescore: true' do
        expect(UserAssessments::PostScoringTasks).to receive(:call!).with(
          user_assessment,
          current_user,
          rescore: true
        )

        described_class.call!(
          user_assessment,
          current_user,
          rescore: true
        )
      end

      context 'when assessment has AI questions' do
        before do
          allow_any_instance_of(Assessment).to receive(:has_ai_questions?).and_return(true)
        end

        context 'when allow_ai_rescore is false' do
          it 'merges AI scores and does NOT trigger AI job' do
            expect(UsersResults::Scoring::MergeAIScores).to receive(:call!).with(
              user_result,
              skip_post_scoring_tasks: true
            )
            expect(AI::ContentAnalysis::TriggerAIScoringJob).not_to receive(:perform_later)

            described_class.call!(user_assessment, current_user, rescore: true, allow_ai_rescore: false)
          end
        end

        context 'when allow_ai_rescore is true' do
          it 'triggers AI job and does NOT merge scores (manually)' do
            expect(UsersResults::Scoring::MergeAIScores).not_to receive(:call!)
            expect(AI::ContentAnalysis::TriggerAIScoringJob).to receive(:perform_later).with(
              user_result.id,
              rescore: true,
              force_regenerate: false,
              admin_job_record_id: nil
            )

            described_class.call!(user_assessment, current_user, rescore: true, allow_ai_rescore: true)
          end
        end
      end
    end
  end
end
