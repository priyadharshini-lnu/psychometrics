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
    end

    context 'when it is an AI assessment' do
      before do
        allow_any_instance_of(Assessment).to receive(:has_ai_questions?).and_return(true)
      end

      it 'calls TriggerAIScoringJob' do
        expect(AI::ContentAnalysis::TriggerAIScoringJob).to receive(:perform_later).with(
          kind_of(Integer),
          rescore: false,
          admin_job_record_id: nil
        )

        described_class.call!(user_assessment, current_user)
      end
    end
  end
end
