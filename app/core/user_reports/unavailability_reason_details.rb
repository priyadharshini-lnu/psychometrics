# frozen_string_literal: true

module UserReports
  class UnavailabilityReasonDetails < Rectify::Query
    REPORT_GENERATING_REASON_MESSAGE = 'Report is being generated'
    REPORT_GENERATION_FAILED_REASON_MESSAGE = 'Report generation failed'
    NO_REPORT_MODULE_REASON_MESSAGE = 'No report module found for this report'
    PENDING_APPROVAL_REASON_TEMPLATE = "Approval status is '%<status>s'"
    CAMPAIGN_SCORING_PENDING_REASON_MESSAGE = 'Campaign scores are not finalized for this user'
    CAMPAIGN_ARTIFACT_RESULTS_PENDING_REASON_MESSAGE =
      'Campaign artifact results are not finalized for this user'
    ASSESSMENT_NOT_COMPLETED_REASON_MESSAGE = 'Assessment is not completed'
    CUSTOM_UPLOAD_REPORT_REASON_MESSAGE = 'Report provider is custom upload'
    NOT_PREPARED_REASON_MESSAGE = 'Report is not yet prepared'
    EXTERNAL_REPORT_PENDING_REASON_MESSAGE = 'Waiting for report from provider'

    private_attr_reader :user_report

    def initialize(user_report)
      @user_report = user_report
    end

    def query
      status_based_reason || unavailability_reasons.find(&:present?) || unknown_reason
    end

    private

    def status_based_reason
      return report_generating_reason if user_report.generating?
      return report_generation_failed_reason if user_report.failed?

      nil
    end

    def unavailability_reasons
      common_unavailability_reasons
    end

    def common_unavailability_reasons
      [
        custom_upload_report_reason,
        assessment_not_completed_reason_if_needed,
        no_report_module_reason_for_common,
        pending_approval_reason,
        campaign_scoring_pending_reason,
        campaign_artifact_results_pending_reason
      ]
    end

    def report_generating_reason
      {
        available: false,
        reason_code: 'report_generating',
        reason_message: REPORT_GENERATING_REASON_MESSAGE
      }
    end

    def report_generation_failed_reason
      {
        available: false,
        reason_code: 'report_generation_failed',
        reason_message: REPORT_GENERATION_FAILED_REASON_MESSAGE
      }
    end

    def custom_upload_report_reason
      return unless user_report.provider_custom_upload?

      {
        available: false,
        reason_code: 'custom_upload_report',
        reason_message: CUSTOM_UPLOAD_REPORT_REASON_MESSAGE
      }
    end

    def no_report_module_reason_for_common
      return unless !user_report.external_report? && user_report.report_modules_empty?

      {
        available: false,
        reason_code: 'no_report_module',
        reason_message: NO_REPORT_MODULE_REASON_MESSAGE
      }
    end

    def pending_approval_reason
      return unless user_report.has_approval_workflow? && !user_report.approved?

      approval_status = formatted_approval_status

      {
        available: false,
        reason_code: 'pending_approval',
        reason_message: format(PENDING_APPROVAL_REASON_TEMPLATE, status: approval_status),
        approval_status: approval_status
      }
    end

    def campaign_scoring_pending_reason
      return unless campaign_scoring_pending?

      {
        available: false,
        reason_code: 'campaign_scoring_pending',
        reason_message: CAMPAIGN_SCORING_PENDING_REASON_MESSAGE
      }
    end

    def campaign_scoring_pending?
      user_report.report.campaign_factors.present? &&
        !user_report.campaign_user&.campaign_scores_finalized?
    end

    def campaign_artifact_results_pending_reason
      return unless campaign_artifact_results_pending?

      {
        available: false,
        reason_code: 'campaign_artifact_results_pending',
        reason_message: CAMPAIGN_ARTIFACT_RESULTS_PENDING_REASON_MESSAGE
      }
    end

    def campaign_artifact_results_pending?
      user_report.report.campaign_ai_artifacts.present? &&
        !user_report.campaign_user&.campaign_artifact_results_finalized?
    end

    def assessment_not_completed_reason_if_needed
      return if user_report.all_assessments_are_scored?

      assessment_not_completed_reason
    end

    def assessment_not_completed_reason
      {
        available: false,
        reason_code: 'assessment_not_completed',
        reason_message: ASSESSMENT_NOT_COMPLETED_REASON_MESSAGE
      }
    end

    def formatted_approval_status
      user_report.approval_status.to_s.titleize
    end

    def unknown_reason
      if user_report.external_report?
        {
          available: false,
          reason_code: 'external_report_pending',
          reason_message: EXTERNAL_REPORT_PENDING_REASON_MESSAGE
        }
      else
        {
          available: false,
          reason_code: 'not_prepared',
          reason_message: NOT_PREPARED_REASON_MESSAGE
        }
      end
    end
  end
end
