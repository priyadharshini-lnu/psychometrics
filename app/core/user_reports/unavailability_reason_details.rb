# frozen_string_literal: true

module UserReports
  class UnavailabilityReasonDetails < Rectify::Query
    REPORT_GENERATING_REASON_MESSAGE = 'Report is being generated'
    REPORT_GENERATION_FAILED_REASON_MESSAGE = 'Report generation failed'
    NO_REPORT_MODULE_REASON_MESSAGE = 'No report module found for this report'
    PENDING_APPROVAL_REASON_TEMPLATE = "Approval status is '%<status>s'"
    PENDING_QC_APPROVAL_REASON_MESSAGE = 'Pending QC report approval'
    QC_COMPLETED_APPROVAL_REASON_MESSAGE = 'Pending final report approval'
    CAMPAIGN_SCORING_PENDING_REASON_MESSAGE = 'Campaign scores are not finalized for this user'
    CAMPAIGN_ARTIFACT_RESULTS_PENDING_REASON_MESSAGE =
      'Campaign artifact results are not finalized for this user'
    ASSESSMENT_NAME_NOT_COMPLETED_REASON_TEMPLATE = 'Assessment %<names>s is not completed'
    ASSESSMENTS_NAME_NOT_COMPLETED_REASON_TEMPLATE = 'Assessments %<names>s are not completed'
    ASSESSOR_NOT_COMPLETED_REASON_TEMPLATE = 'Assessor %<names>s is not completed'
    ASSESSORS_NOT_COMPLETED_REASON_TEMPLATE = 'Assessors %<names>s are not completed'
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
        reason_message: pending_approval_reason_message,
        approval_status: approval_status
      }
    end

    def pending_approval_reason_message
      case user_report.approval_status.to_s
        when 'pending_qc'
          PENDING_QC_APPROVAL_REASON_MESSAGE
        when 'qc_completed'
          QC_COMPLETED_APPROVAL_REASON_MESSAGE
        else
          format(PENDING_APPROVAL_REASON_TEMPLATE, status: formatted_approval_status)
      end
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
      assessment_names = incomplete_assessment_names
      return build_assessment_reason(assessment_names, singular: true) if assessment_names.one?
      return build_assessment_reason(assessment_names, singular: false) if assessment_names.many?

      assessor_names = incomplete_assessor_names
      return build_assessor_reason(assessor_names, singular: true) if assessor_names.one?
      return build_assessor_reason(assessor_names, singular: false) if assessor_names.many?

      nil
    end

    def build_assessment_reason(names, singular:)
      template = if singular
                   ASSESSMENT_NAME_NOT_COMPLETED_REASON_TEMPLATE
                 else
                   ASSESSMENTS_NAME_NOT_COMPLETED_REASON_TEMPLATE
                 end
      {
        available: false,
        reason_code: 'assessment_not_completed',
        reason_message: format(template, names: singular ? names.first : names.join(', '))
      }
    end

    def build_assessor_reason(names, singular:)
      template = singular ? ASSESSOR_NOT_COMPLETED_REASON_TEMPLATE : ASSESSORS_NOT_COMPLETED_REASON_TEMPLATE
      {
        available: false,
        reason_code: 'assessment_not_completed',
        reason_message: format(template, names: singular ? names.first : names.join(', '))
      }
    end

    def incomplete_assessor_names
      assessor_relationship_id = Relationship.assessor_relationship&.id
      return [] if assessor_relationship_id.blank?

      User.joins(:evaluator_user_assessments).
        where(
          user_assessments: {
            campaign_id: user_report.campaign_id,
            subject_id: user_report.user_id,
            assessment_id: user_report.report.assessment_ids,
            relationship_id: assessor_relationship_id
          }
        ).
        merge(UserAssessment.deemed_incomplete).
        distinct.
        pluck(Arel.sql("COALESCE(NULLIF(TRIM(CONCAT(users.first_name, ' ', users.last_name)), ''), users.email)"))
    end

    def incomplete_assessment_names
      completed_assessment_ids = user_report.user_results.
                                 joins(:user_assessment).
                                 pluck('user_assessments.assessment_id')
      incomplete_assessment_ids = user_report.report.assessment_ids - completed_assessment_ids

      return [] if incomplete_assessment_ids.empty?

      Assessment.where(id: incomplete_assessment_ids).pluck(:name)
    end

    def formatted_approval_status
      case user_report.approval_status.to_s
        when 'pending_qc'
          'Pending QC'
        when 'qc_completed'
          'QC completed'
        else
          user_report.approval_status.to_s.titleize
      end
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
