# frozen_string_literal: true

module Campaigns
  module Users
    class AddReport < BaseCommand
      private_attr_reader :campaign_user, :user, :campaign, :report, :options, :idp_license_usage

      def initialize(campaign_user, report, options = {})
        @campaign_user = campaign_user
        @user = campaign_user.user
        @campaign = campaign_user.campaign
        @report = report
        @options = options
        @idp_license_usage = options[:idp_license_usage] || false
      end

      def call
        Licenses::Use.call!(campaign, user, report, options[:report_family_id]) unless idp_license_usage
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

        handle_hogan_user_assessments_creation(user_assessments, user_report)
        recompute_user_results(user_assessments)
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

        user_assessment
      end

      def handle_hogan_user_assessments_creation(user_assessments, user_report)
        ::Hogan::HandleAssignHoganAssessments.call!(user, user_assessments, user_report, options)
      end

      def recompute_user_results(user_assessments)
        return unless options[:operation] == 'add_with_existing_response'

        user_assessments.each do |user_assessment|
          ::UsersResults::RecomputeJob.perform_later(user_assessment.users_result, user)
        end
      end

      def create_assessment_to_user(assessment)
        norm_assessment = (options[:norm_ids] || []).find { |na| na[:id] == assessment.id } || {}
        existing_result = existing_user_result_to_copy(assessment)

        user_result = existing_result ? UsersResults::Copy.call!(existing_result) : UsersResult.create!
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
        create_external_user_assessment_record(user_assessment, assessment, existing_result, campaign_assessment)

        user_assessment
      end

      def create_external_user_assessment_record(user_assessment, assessment, existing_result, campaign_assessment)
        if assessment.saville?
          create_saville_assessment(user_assessment, existing_result)
        elsif assessment.pearson?
          create_pearson_assessment(user_assessment, existing_result)
        elsif assessment.iiht?
          create_iiht_assessment(user_assessment)
        elsif assessment.mettl?
          create_mettl_assessment(user_assessment, existing_result, campaign_assessment)
        elsif assessment.simulation?
          create_simulation_assessment(user_assessment, existing_result, campaign_assessment)
        end
      end

      def create_saville_assessment(user_assessment, existing_result)
        existing_saville_user_assessment = existing_result&.saville_user_assessment
        user_assessment.create_saville_user_assessment(
          norm_id: existing_saville_user_assessment&.norm_id || user_assessment.applicable_external_norm_id,
          data_seprator: existing_saville_user_assessment&.data_seprator,
          candidate_id: existing_saville_user_assessment&.candidate_id
        )
      end

      def create_pearson_assessment(user_assessment, existing_result)
        existing_pearson_user_assessment = existing_result&.pearson_user_assessment
        user_assessment.create_pearson_user_assessment(
          norm_id: existing_pearson_user_assessment&.norm_id || user_assessment.applicable_external_norm_id,
          schedule_id: existing_pearson_user_assessment&.schedule_id,
          url: existing_pearson_user_assessment&.url
        )
      end

      def create_iiht_assessment(user_assessment)
        user_assessment.create_iiht_user_assessment
      end

      def create_mettl_assessment(user_assessment, existing_result, campaign_assessment)
        existing_mettl_user_assessment = existing_result&.mettl_user_assessment
        user_assessment.create_mettl_user_assessment(
          email: existing_mettl_user_assessment&.url,
          mettl_schedule_record_id: existing_mettl_user_assessment&.mettl_schedule_record_id || campaign_assessment&.mettl_schedule_record_id, # rubocop:disable Layout/LineLength
          url: existing_mettl_user_assessment&.url
        )
      end

      def create_simulation_assessment(user_assessment, existing_result, campaign_assessment)
        existing_simulation_user_assessment = existing_result&.simulation_user_assessment
        content_variation_id = existing_simulation_user_assessment&.content_variation_id ||
                               default_content_variation_id(user_assessment, campaign_assessment)

        user_assessment.create_simulation_user_assessment(
          participant_id: existing_simulation_user_assessment&.participant_id,
          content_variation_id: content_variation_id,
          time_extension: existing_simulation_user_assessment&.time_extension
        )
      end

      def existing_user_result_to_copy(assessment)
        return if options[:operation] == 'add_and_allow_new_response'

        evaluation_results = campaign_user.evaluation_results.
                             joins(:user_assessment)

        if existing_hogan_credential && assessment.hogan?
          evaluation_results = evaluation_results.
                               joins(user_assessment: :hogan_credential).
                               where(hogan_credential: { id: existing_hogan_credential.id })
        end

        evaluation_results.order(created_at: :desc).find_by(user_assessments: { assessment_id: assessment.id })
      end

      def generate_report_pdf(user_report)
        ::UserReports::GenerateAndSavePdfJob.perform_later(user_report, user, options[:pdf_options] || {})
      end

      def default_content_variation_id(user_assessment, campaign_assessment)
        simulation_settings = user_assessment.assessment.simulation_settings

        campaign_assessment&.external_config&.dig('content_variation_id') ||
          simulation_settings[:default_content_variation_id]
      end

      def existing_hogan_credential
        @existing_hogan_credential ||= user.hogan_credential
      end
    end
  end
end
