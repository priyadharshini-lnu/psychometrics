# frozen_string_literal: true

module UserReports
  class UnavailabilityReasonDetails < Rectify::Query
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
      [
        custom_upload_report_reason,
        *assessment_reasons,
        ai_scoring_approval_pending_reason,
        no_report_module_reason_for_common,
        pending_approval_reason,
        campaign_scoring_pending_reason,
        campaign_artifact_results_pending_reason
      ]
    end

    def assessment_reasons
      [AssessmentNotCompletedReasonBuilder.new(user_report).build].compact
    end

    def report_generating_reason
      {
        available: false,
        reason_code: 'report_generating',
        reason_message: I18n.t('shared.user_reports_report_generating_reason_message')
      }
    end

    def report_generation_failed_reason
      {
        available: false,
        reason_code: 'report_generation_failed',
        reason_message: I18n.t('shared.user_reports_report_generation_failed_reason_message')
      }
    end

    def custom_upload_report_reason
      return unless user_report.provider_custom_upload?

      {
        available: false,
        reason_code: 'custom_upload_report',
        reason_message: I18n.t('shared.user_reports_custom_upload_report_reason_message')
      }
    end

    def no_report_module_reason_for_common
      return unless !user_report.external_report? && user_report.report_modules_empty?

      {
        available: false,
        reason_code: 'no_report_module',
        reason_message: I18n.t('shared.user_reports_no_report_module_reason_message')
      }
    end

    def pending_approval_reason
      return unless user_report.has_approval_workflow? && !user_report.approved?

      {
        available: false,
        reason_code: 'pending_approval',
        reason_message: pending_approval_reason_message,
        approval_status: formatted_approval_status
      }
    end

    def pending_approval_reason_message
      case user_report.approval_status.to_s
        when 'pending_qc'
          I18n.t('shared.user_reports_pending_qc_approval_reason_message')
        when 'qc_completed'
          I18n.t('shared.user_reports_qc_completed_approval_reason_message')
        else
          I18n.t('shared.user_reports_pending_approval_reason_template', status: formatted_approval_status)
      end
    end

    def ai_scoring_approval_pending_reason
      return unless ai_scoring_approval_pending?

      {
        available: false,
        reason_code: 'ai_scoring_approval_pending',
        reason_message: ai_scoring_approval_pending_reason_message
      }
    end

    def ai_scoring_approval_pending?
      ai_scoring_approval_statuses.any?
    end

    def ai_scoring_approval_pending_reason_message
      statuses = ai_scoring_approval_statuses

      if pending_qc_ai_scoring_approval?(statuses)
        return I18n.t('shared.user_reports_pending_qc_ai_scoring_approval_reason_message')
      end

      if pending_final_ai_scoring_approval?(statuses)
        return I18n.t('shared.user_reports_pending_final_ai_scoring_approval_reason_message')
      end

      nil
    end

    def pending_qc_ai_scoring_approval?(statuses)
      statuses.any? { |status| status.blank? || status == 'pending' }
    end

    def pending_final_ai_scoring_approval?(statuses)
      statuses.include?('assessor_approved')
    end

    def ai_scoring_approval_statuses
      UserAssessment.
        joins(
          <<~SQL.squish
            INNER JOIN ai_scoring_approval_settings
              ON ai_scoring_approval_settings.campaign_id = user_assessments.campaign_id
             AND ai_scoring_approval_settings.assessment_id = user_assessments.assessment_id
          SQL
        ).
        where(
          campaign_id: user_report.campaign_id,
          subject_id: user_report.user_id,
          assessment_id: user_report.report.assessment_ids,
          status: :completed
        ).
        where.not(approval_status: %w[auto_approved approver_approved]).
        pluck(:approval_status)
    end

    def campaign_scoring_pending_reason
      return unless campaign_scoring_pending?

      {
        available: false,
        reason_code: 'campaign_scoring_pending',
        reason_message: I18n.t('shared.user_reports_campaign_scoring_pending_reason_message')
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
        reason_message: I18n.t('shared.user_reports_campaign_artifact_results_pending_reason_message')
      }
    end

    def campaign_artifact_results_pending?
      user_report.report.campaign_ai_artifacts.present? &&
        !user_report.campaign_user&.campaign_artifact_results_finalized?
    end

    def formatted_approval_status
      case user_report.approval_status.to_s
        when 'pending_qc'
          I18n.t('shared.user_reports_approval_status_pending_qc')
        when 'qc_completed'
          I18n.t('shared.user_reports_approval_status_qc_completed')
        else
          user_report.approval_status.to_s.titleize
      end
    end

    def unknown_reason
      if user_report.external_report?
        {
          available: false,
          reason_code: 'external_report_pending',
          reason_message: I18n.t('shared.user_reports_external_report_pending_reason_message')
        }
      else
        {
          available: false,
          reason_code: 'not_prepared',
          reason_message: I18n.t('shared.user_reports_not_prepared_reason_message')
        }
      end
    end
  end
end
