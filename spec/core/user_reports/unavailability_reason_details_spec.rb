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

    allow_any_instance_of(described_class).to receive(:incomplete_assessment_names).and_return([])
    allow_any_instance_of(described_class).to receive(:incomplete_assessor_names).and_return([])
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
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessment_names).
          and_return(['AS1'])
      end

      it 'returns assessment_not_completed reason with singular assessment message' do
        expect(result).to include(
          reason_code: 'assessment_not_completed',
          reason_message: 'Assessment AS1 is not completed'
        )
      end

      it 'prioritizes assessment message over assessor message' do
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_names).
          and_return(['Assessor 1'])

        expect(result).to include(
          reason_code: 'assessment_not_completed',
          reason_message: 'Assessment AS1 is not completed'
        )
      end

      context 'when multiple assessments are incomplete' do
        before do
          allow_any_instance_of(described_class).
            to receive(:incomplete_assessment_names).
            and_return(%w[AS1 AS2])
        end

        it 'returns assessment_not_completed reason with plural assessment message' do
          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: 'Assessments AS1, AS2 are not completed'
          )
        end
      end

      context 'when no assessments are incomplete but assessor is incomplete' do
        before do
          allow_any_instance_of(described_class).
            to receive(:incomplete_assessment_names).
            and_return([])
          allow_any_instance_of(described_class).
            to receive(:incomplete_assessor_names).
            and_return(['Assessor 1'])
        end

        it 'returns assessment_not_completed reason with singular assessor message' do
          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: 'Assessor Assessor 1 is not completed'
          )
        end
      end

      context 'when no assessments are incomplete but multiple assessors are incomplete' do
        before do
          allow_any_instance_of(described_class).
            to receive(:incomplete_assessment_names).
            and_return([])
          allow_any_instance_of(described_class).
            to receive(:incomplete_assessor_names).
            and_return(['Assessor 1', 'Assessor 2'])
        end

        it 'returns assessment_not_completed reason with plural assessor message' do
          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: 'Assessors Assessor 1, Assessor 2 are not completed'
          )
        end
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

    context 'when approval is pending qc' do
      before do
        allow(user_report).to receive_messages(
          has_approval_workflow?: true,
          approved?: false,
          approval_status: :pending_qc
        )
      end

      it 'returns pending_approval reason with pending qc message' do
        expect(result).to include(
          reason_code: 'pending_approval',
          reason_message: 'Pending QC report approval',
          approval_status: 'Pending QC'
        )
      end
    end

    context 'when approval is qc completed' do
      before do
        allow(user_report).to receive_messages(
          has_approval_workflow?: true,
          approved?: false,
          approval_status: :qc_completed
        )
      end

      it 'returns pending_approval reason with final approval message' do
        expect(result).to include(
          reason_code: 'pending_approval',
          reason_message: 'Pending final report approval',
          approval_status: 'QC completed'
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
