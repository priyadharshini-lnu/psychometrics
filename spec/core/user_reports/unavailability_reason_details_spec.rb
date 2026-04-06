# frozen_string_literal: true

require 'rails_helper'

describe UserReports::UnavailabilityReasonDetails do
  subject(:result) { described_class.new(user_report).query }

  let(:user_report) { instance_double(UserReport) }
  let(:report) { instance_double(Report, campaign_factors: [], campaign_ai_artifacts: []) }
  let(:campaign_user) { instance_double(CampaignUser) }

  before do
    allow(user_report).to receive_messages(
      generating?: false,
      failed?: false,
      provider_custom_upload?: false,
      external_report?: false,
      report_modules_empty?: false,
      has_approval_workflow?: false,
      approved?: true,
      all_assessments_are_scored?: true,
      report: report,
      campaign_user: campaign_user
    )
  end

  describe '#query' do
    context 'when report is generating' do
      before { allow(user_report).to receive(:generating?).and_return(true) }

      it 'returns report_generating reason' do
        expect(result).to include(
          reason_code: 'report_generating',
          reason_message: 'Report is being generated'
        )
      end
    end

    context 'when report generation failed' do
      before { allow(user_report).to receive(:failed?).and_return(true) }

      it 'returns report_generation_failed reason' do
        expect(result).to include(
          reason_code: 'report_generation_failed',
          reason_message: 'Report generation failed'
        )
      end
    end

    context 'when provider is custom upload' do
      before { allow(user_report).to receive(:provider_custom_upload?).and_return(true) }

      it 'returns custom_upload_report reason' do
        expect(result).to include(
          reason_code: 'custom_upload_report',
          reason_message: 'Report provider is custom upload'
        )
      end
    end

    context 'when assessment is not completed' do
      before { allow(user_report).to receive(:all_assessments_are_scored?).and_return(false) }

      it 'returns assessment_not_completed reason' do
        expect(result).to include(
          reason_code: 'assessment_not_completed',
          reason_message: 'Assessment is not completed'
        )
      end
    end

    context 'when no report module exists for non-external report' do
      before do
        allow(user_report).to receive_messages(
          external_report?: false,
          report_modules_empty?: true
        )
      end

      it 'returns no_report_module reason' do
        expect(result).to include(
          reason_code: 'no_report_module',
          reason_message: 'No report module found for this report'
        )
      end
    end

    context 'when approval is pending' do
      before do
        allow(user_report).to receive_messages(
          has_approval_workflow?: true,
          approved?: false,
          approval_status: :pending_review
        )
      end

      it 'returns pending_approval reason with status' do
        expect(result).to include(
          reason_code: 'pending_approval',
          reason_message: "Approval status is 'Pending Review'",
          approval_status: 'Pending Review'
        )
      end
    end

    context 'when campaign scoring is pending' do
      let(:report) { instance_double(Report, campaign_factors: [double], campaign_ai_artifacts: []) }

      before do
        allow(campaign_user).to receive(:campaign_scores_finalized?).and_return(false)
      end

      it 'returns campaign_scoring_pending reason' do
        expect(result).to include(
          reason_code: 'campaign_scoring_pending',
          reason_message: 'Campaign scores are not finalized for this user'
        )
      end
    end

    context 'when campaign artifact results are pending' do
      let(:report) { instance_double(Report, campaign_factors: [], campaign_ai_artifacts: [double]) }

      before do
        allow(campaign_user).to receive(:campaign_artifact_results_finalized?).and_return(false)
      end

      it 'returns campaign_artifact_results_pending reason' do
        expect(result).to include(
          reason_code: 'campaign_artifact_results_pending',
          reason_message: 'Campaign artifact results are not finalized for this user'
        )
      end
    end

    context 'when no specific reason is found' do
      context 'for external report' do
        before { allow(user_report).to receive(:external_report?).and_return(true) }

        it 'returns external_report_pending reason' do
          expect(result).to include(
            reason_code: 'external_report_pending',
            reason_message: 'Waiting for report from provider'
          )
        end
      end

      context 'for internal report' do
        before { allow(user_report).to receive(:external_report?).and_return(false) }

        it 'returns not_prepared reason' do
          expect(result).to include(
            reason_code: 'not_prepared',
            reason_message: 'Report is not yet prepared'
          )
        end
      end
    end
  end
end
