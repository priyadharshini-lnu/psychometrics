# frozen_string_literal: true

module Campaigns
  module Users
    class AddReport < BaseCommand
      private_attr_reader :campaign_user, :user, :campaign, :report, :options

      def initialize(campaign_user, report, options = {})
        @campaign_user = campaign_user
        @user = campaign_user.user
        @campaign = campaign_user.campaign
        @report = report
        @options = options
      end

      def call
        Licenses::Use.call!(campaign, user, report, options[:report_family_id])
        user_report = UserReport.find_by(campaign: campaign, report: report, user: user)
        unless user_report
          user_report = UserReport.create!(
            campaign: campaign,
            report: report,
            user: user,
            user_access: options[:user_access].nil? ? get_user_access(report) : options[:user_access],
            report_family_id: options[:report_family_id]
          )
          AuditLogModule.audit!(
            :create, user_report,
            payload: user_report.log_attributes.merge(options.slice(:user_access, :report_family_id, :operation)),
            user: options[:current_user],
            campaign: campaign
          )
        end
        return broadcast :ok, user_report: user_report if report.data_only?

        user_assessments = assessments.map do |assessment|
          find_or_create_assessment_to_user(assessment)
        end
        set_approval_status_for_user_report(user_report)
        generate_report_pdf(user_report) unless user_report.report.hogan?

        broadcast :ok,
                  user_report: user_report,
                  user_assessments: user_assessments
      end

      private

      def get_user_access(report)
        campaign.campaign_reports.find_by(report_id: report.id)&.user_access || false
      end

      def assessments
        options[:assessments].reject { |a| Assessment::NON_USER_ASSESSMENT_CATEGORY.include?(a.category) }
      end

      def set_approval_status_for_user_report(user_report)
        return user_report.update_attribute(:approval_status, :approved) unless user_report.has_approval_workflow?

        return user_report.start_approval! if user_report.all_assessments_are_scored?
      end

      def find_or_create_assessment_to_user(assessment)
        user_assessment = UserAssessment.find_by(
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          evaluator: user,
          relationship: Relationship.self_relationship
        )
        unless user_assessment
          user_assessment = create_assessment_to_user(assessment)
          AuditLogModule.audit!(
            :create, user_assessment,
            payload: user_assessment.log_attributes.merge(operation: options[:operation]),
            user: options[:current_user],
            campaign: campaign
          )
        end
        if assessment.hogan? && user.hogan_credential && user_assessment.completed?
          Hogan::HandleAssessmentCompletion.call!(user_assessment)
        end
        user_assessment
      end

      def create_assessment_to_user(assessment)
        norm_assessment = (options[:norm_ids] || []).find { |na| na[:id] == assessment.id } || {}
        existing_result = existing_user_result_to_copy(assessment)
        user_result = existing_result ? UsersResults::Copy.call!(existing_result) : create_new_user_result(assessment)
        campaign_assessment = CampaignAssessment.find_by(campaign: campaign, assessment: assessment)

        user_assessment = UserAssessment.create(
          users_result_id:  user_result.id,
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          norm_id: norm_assessment[:norm_id],
          fixed_norm: norm_assessment[:norm_id].present?,
          evaluator: user,
          relationship: Relationship.self_relationship,
          status: existing_result&.status || :not_started,
          completed_at: existing_result&.completed_at,
          completion_reason: existing_result&.completion_reason,
          require_scheduling: campaign_assessment&.require_scheduling&.present?
        )
        create_external_user_assessment_record(user_assessment, assessment, existing_result)

        user_assessment
      end

      def create_external_user_assessment_record(user_assessment, assessment, existing_result)
        if assessment.saville?
          existing_saville_user_assessment = existing_result&.saville_user_assessment
          user_assessment.create_saville_user_assessment(
            norm_id: existing_saville_user_assessment&.norm_id || user_assessment.applicable_external_norm_id,
            data_seprator: existing_saville_user_assessment&.data_seprator
          )
        elsif assessment.pearson?
          existing_pearson_user_assessment = existing_result&.pearson_user_assessment
          user_assessment.create_pearson_user_assessment(
            norm_id: existing_pearson_user_assessment&.norm_id || user_assessment.applicable_external_norm_id,
            schedule_id: existing_pearson_user_assessment&.schedule_id,
            url: existing_pearson_user_assessment&.url
          )
        elsif assessment.iiht?
          user_assessment.create_iiht_user_assessment
        end
      end

      def existing_user_result_to_copy(assessment)
        return if options[:operation] == 'add_and_allow_new_response'

        campaign_user.evaluation_results.
          joins(:user_assessment).
          order(created_at: :desc).
          find_by(user_assessments: { assessment_id: assessment.id })
      end

      def create_new_user_result(assessment)
        user_result = UsersResult.create!

        if assessment.mindmill?
          user_result.create_mindmill_credential(
            user_name: "#{Settings.assigns.mindmill_prefix}_#{user_result.id}",
            password: SecureRandom.hex
          )
        end

        user_result
      end

      def generate_report_pdf(user_report)
        ::UserReports::GenerateAndSavePdfJob.perform_later(user_report, user, options[:pdf_options] || {})
      end
    end
  end
end
