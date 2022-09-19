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
        user_report = UserReport.create_with(
          user_access: options[:user_access],
          report_family_id: options[:report_family_id]
        ).find_or_create_by!(campaign: campaign, report: report, user: user)
        return broadcast :ok, user_report: user_report if report.data_only?

        user_assessments = options[:assessments].map do |assessment|
          find_or_create_assessment_to_user(assessment, user_report)
        end
        generate_report_pdf(user_report) unless user_report.report.hogan?

        broadcast :ok,
                  user_report: user_report,
                  user_assessments: user_assessments
      end

      private

      def find_or_create_assessment_to_user(assessment, user_report)
        user_assessment = UserAssessment.find_by(
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          evaluator: user,
          relationship: Relationship.self_relationship
        )
        user_assessment ||= create_assessment_to_user(assessment)
        if assessment.hogan? && user.hogan_credential && !user_assessment.not_started?
          Hogan::AddReportsJob.set(wait: 2.seconds).perform_later(
            user_assessment, [user_report], user.hogan_credential, user.project
          )
        end
        user_assessment
      end

      def create_assessment_to_user(assessment) # rubocop:disable Metrics/PerceivedComplexity
        norm_assessment = (options[:norm_ids] || []).find { |na| na[:id] == assessment.id } || {}
        existing_result = existing_user_result_to_copy(assessment)
        user_result = existing_result ? UsersResults::Copy.call!(existing_result) : create_new_user_result(assessment)
        user_assessment = UserAssessment.create(
          users_result_id:  user_result.id,
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          norm_id: norm_assessment[:norm_id],
          evaluator: user,
          relationship: Relationship.self_relationship,
          status: existing_result&.status || :not_started,
          completed_at: existing_result&.completed_at,
          completion_reason: existing_result&.completion_reason
        )

        if assessment.saville?
          user_assessment.create_saville_user_assessment(norm_id: user_assessment.applicable_external_norm_id)
        elsif assessment.pearson?
          user_assessment.create_pearson_user_assessment(norm_id: user_assessment.applicable_external_norm_id)
        elsif assessment.iiht?
          user_assessment.create_iiht_user_assessment
        end
        user_assessment
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
