# frozen_string_literal: true

require 'rails_helper'

describe UserAssessments::PostScoringTasks do
  let(:assessment) { create(:assessment) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:user_result) { user_assessment.users_result }
  let(:current_user) { user_assessment.user }

  before do
    allow(UserAssessments::NormalizeFactorScores).to receive(:call)
    allow(UsersResults::GenerateReports).to receive(:call!)
    allow_any_instance_of(UserAssessments::Webhook).to receive(:publish_assessment_completed)
    allow_any_instance_of(UserAssessments::Webhook).to receive(:publish_assessment_raw_response)
    allow_any_instance_of(UserAssessments::Webhook).to receive(:publish_results_available)
  end

  describe '#call' do
    it 'updates the timestamp' do
      expect do
        described_class.call!(user_assessment)
      end.to change { user_assessment.reload.score_calculated_at }.from(nil)
      expect(user_assessment.score_calculated).to be true
    end

    context 'when rescore is false (default)' do
      it 'generates reports and triggers webhooks' do
        expect(UserAssessments::NormalizeFactorScores).to receive(:call)
        expect(UsersResults::GenerateReports).to receive(:call!)
        expect_any_instance_of(UserAssessments::Webhook).to receive(:publish_assessment_completed)

        described_class.call!(user_assessment)
      end
    end

    context 'when rescore is true' do
      it 'skips report generation and webhooks but still normalizes scores' do
        expect(UserAssessments::NormalizeFactorScores).to receive(:call)
        expect(UsersResults::GenerateReports).not_to receive(:call!)
        expect_any_instance_of(UserAssessments::Webhook).not_to receive(:publish_assessment_completed)

        described_class.call!(user_assessment, rescore: true)
      end

      it 'still updates timestamp and starts approvals' do
        expect do
          described_class.call!(user_assessment, rescore: true)
        end.to change { user_assessment.reload.score_calculated_at }.from(nil)

        user_report = create(:user_report, user_id: user_assessment.subject_id,
campaign_id: user_assessment.campaign_id)
        allow(user_assessment).to receive(:user_reports).and_return([user_report])
        expect(user_report).to receive(:start_approval!)

        described_class.call!(user_assessment, rescore: true)
      end
    end
  end
end
