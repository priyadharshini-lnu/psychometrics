# frozen_string_literal: true

require 'rails_helper'

describe UserReports::UnavailabilityReasonDetails do
  subject(:result) { described_class.new(user_report).query }

  let(:user_report) { double('UserReport') }
  let(:report) { double('Report', campaign_factors: [], campaign_ai_artifacts: []) }
  let(:campaign_user) { instance_double(CampaignUser) }
  let(:builder_double) { instance_double(UserReports::AssessmentNotCompletedReasonBuilder, build: nil) }

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

    allow(UserReports::AssessmentNotCompletedReasonBuilder).to receive(:new).and_return(builder_double)
    allow_any_instance_of(described_class).to receive(:ai_scoring_approval_statuses).and_return([])
  end

  describe '#query' do
    context 'when report is generating' do
      before { allow(user_report).to receive(:generating?).and_return(true) }

      it 'returns report_generating reason' do
        expect(result).to include(
          reason_code: 'report_generating',
          reason_message: I18n.t('shared.user_reports_report_generating_reason_message')
        )
      end
    end

    context 'when report generation failed' do
      before { allow(user_report).to receive(:failed?).and_return(true) }

      it 'returns report_generation_failed reason' do
        expect(result).to include(
          reason_code: 'report_generation_failed',
          reason_message: I18n.t('shared.user_reports_report_generation_failed_reason_message')
        )
      end
    end

    context 'when provider is custom upload' do
      before { allow(user_report).to receive(:provider_custom_upload?).and_return(true) }

      it 'returns custom_upload_report reason' do
        expect(result).to include(
          reason_code: 'custom_upload_report',
          reason_message: I18n.t('shared.user_reports_custom_upload_report_reason_message')
        )
      end
    end

    context 'when assessment is not completed' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
      end

      it 'returns assessment_not_completed reason with singular assessment message' do
        allow(builder_double).to receive(:build).and_return(
          {
            available: false,
            reason_code: 'assessment_not_completed',
            reason_message: I18n.t('shared.user_reports_assessment_name_not_completed_reason_template', names: 'AS1')
          }
        )

        expect(result).to include(
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_assessment_name_not_completed_reason_template', names: 'AS1')
        )
      end

      it 'includes assessment and assessor messages when both are incomplete' do
        allow(builder_double).to receive(:build).and_return(
          {
            available: false,
            reason_code: 'assessment_not_completed',
            reason_message: "- #{I18n.t('shared.user_reports_assessment_name_not_completed_reason_template',
                                        names: 'AS1')}\n" \
                            "- #{I18n.t('shared.user_reports_assessor_not_completed_reason_template',
                                        names: 'Assessor 1')}"
          }
        )

        expect(result).to include(
          reason_code: 'assessment_not_completed',
          reason_message: "- #{I18n.t('shared.user_reports_assessment_name_not_completed_reason_template',
                                      names: 'AS1')}\n- #{I18n.t(
                                        'shared.user_reports_assessor_not_completed_reason_template',
                                        names: 'Assessor 1'
                                      )}"
        )
      end

      context 'when multiple assessments are incomplete' do
        it 'returns assessment_not_completed reason with plural assessment message' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: I18n.t('shared.user_reports_assessments_name_not_completed_reason_template',
                                     names: 'AS1, AS2')
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: I18n.t('shared.user_reports_assessments_name_not_completed_reason_template',
                                   names: 'AS1, AS2')
          )
        end
      end

      context 'when no assessments are incomplete but assessor is incomplete' do
        it 'returns assessment_not_completed reason with singular assessor message' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: I18n.t('shared.user_reports_assessor_not_completed_reason_template', names: 'Assessor 1')
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: I18n.t('shared.user_reports_assessor_not_completed_reason_template', names: 'Assessor 1')
          )
        end
      end

      context 'when no assessments are incomplete but multiple assessors are incomplete' do
        it 'returns assessment_not_completed reason with plural assessor message' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: I18n.t('shared.user_reports_assessors_not_completed_reason_template',
                                     names: 'Assessor 1, Assessor 2')
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: I18n.t('shared.user_reports_assessors_not_completed_reason_template',
                                   names: 'Assessor 1, Assessor 2')
          )
        end
      end

      context 'when only lead assessor form is incomplete' do
        it 'returns assessment_not_completed reason with singular lead assessor message' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                     names: 'Lead Assessor 1')
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                   names: 'Lead Assessor 1')
          )
        end
      end

      context 'when assessor and lead assessor forms are incomplete' do
        it 'returns assessment_not_completed reason with both assessor and lead assessor messages' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: "- #{I18n.t('shared.user_reports_assessor_not_completed_reason_template',
                                          names: 'Assessor 1')}\n" \
                              "- #{I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                          names: 'Lead Assessor 1')}"
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: "- #{I18n.t('shared.user_reports_assessor_not_completed_reason_template',
                                        names: 'Assessor 1')}\n" \
                            "- #{I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                        names: 'Lead Assessor 1')}"
          )
        end
      end

      context 'when assessment, assessor and lead assessor forms are incomplete' do
        it 'returns assessment_not_completed reason as bullet list with all messages' do
          allow(builder_double).to receive(:build).and_return(
            {
              available: false,
              reason_code: 'assessment_not_completed',
              reason_message: "- #{I18n.t('shared.user_reports_assessment_name_not_completed_reason_template',
                                          names: 'AS1')}\n" \
                              "- #{I18n.t('shared.user_reports_assessor_not_completed_reason_template',
                                          names: 'Assessor 1')}\n" \
                              "- #{I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                          names: 'Lead Assessor 1')}"
            }
          )

          expect(result).to include(
            reason_code: 'assessment_not_completed',
            reason_message: "- #{I18n.t('shared.user_reports_assessment_name_not_completed_reason_template',
                                        names: 'AS1')}\n" \
                            "- #{I18n.t('shared.user_reports_assessor_not_completed_reason_template',
                                        names: 'Assessor 1')}\n" \
                            "- #{I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                        names: 'Lead Assessor 1')}"
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
          reason_message: I18n.t('shared.user_reports_no_report_module_reason_message')
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
        formatted_status = :pending_review.to_s.titleize

        expect(result).to include(
          reason_code: 'pending_approval',
          reason_message: I18n.t('shared.user_reports_pending_approval_reason_template', status: formatted_status),
          approval_status: formatted_status
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
          reason_message: I18n.t('shared.user_reports_pending_qc_approval_reason_message'),
          approval_status: I18n.t('shared.user_reports_approval_status_pending_qc')
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
          reason_message: I18n.t('shared.user_reports_qc_completed_approval_reason_message'),
          approval_status: I18n.t('shared.user_reports_approval_status_qc_completed')
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
          reason_message: I18n.t('shared.user_reports_campaign_scoring_pending_reason_message')
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
          reason_message: I18n.t('shared.user_reports_campaign_artifact_results_pending_reason_message')
        )
      end
    end

    context 'when no specific reason is found' do
      context 'for external report' do
        before { allow(user_report).to receive(:external_report?).and_return(true) }

        it 'returns external_report_pending reason' do
          expect(result).to include(
            reason_code: 'external_report_pending',
            reason_message: I18n.t('shared.user_reports_external_report_pending_reason_message')
          )
        end
      end

      context 'for internal report' do
        before { allow(user_report).to receive(:external_report?).and_return(false) }

        it 'returns not_prepared reason' do
          expect(result).to include(
            reason_code: 'not_prepared',
            reason_message: I18n.t('shared.user_reports_not_prepared_reason_message')
          )
        end
      end
    end
  end
end
