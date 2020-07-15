# frozen_string_literal: true

module Campaigns
  module Users
    class AddReport < BaseCommand
      private_attr_reader :campaigns_user, :user, :campaign, :report, :options

      def initialize(campaigns_user, report, options = {})
        @campaigns_user = campaigns_user
        @user = campaigns_user.user
        @campaign = campaigns_user.campaign
        @report = report
        @options = options
      end

      def call
        Licenses::Use.call(campaign, user, report) if options[:use_license]
        campaigns_users_report = CampaignsUsersReport.create_with(user_access: options[:user_access]).
                                 find_or_create_by!(campaign: campaign, report: report, user: user)

        users_campaigns_assessments = report.assessments.map { |assessment| add_assessment_to_user(assessment) }
        generate_report_pdf(campaigns_users_report)

        broadcast :ok,
                  campaigns_users_report: campaigns_users_report,
                  users_campaigns_assessments: users_campaigns_assessments
      end

      private

      def add_assessment_to_user(assessment)
        users_campaigns_assessment = UsersCampaignsAssessment.create_with(
          users_result_id: user_result_id(assessment.id)
        ).find_or_create_by!(
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          evaluator: user,
          relationship: Relationship.self_relationship
        )

        if assessment.hogan? && campaigns_user.hogan_credential
          # TODO: Need to call Hogan::AssignAndLoadResultsJob when we start using user_result instead of assign
          # https://tte.atlassian.net/browse/LH-824
        end
        users_campaigns_assessment
      end

      def user_result_id(assessment_id)
        return nil if options[:operation] == 'add_and_allow_new_response'

        campaigns_user.evaluation_results.find_by(assessment_id: assessment_id)&.id
      end

      def generate_report_pdf(campaigns_users_report)
        assessment_ids = campaigns_users_report.report.assessments.pluck(:id)

        incomplete_assessment = UsersCampaignsAssessment.exists?(
          assessment_id: assessment_ids,
          subject_id: user.id,
          evaluator_id: user.id,
          users_result_id: nil
        )

        ::CampaignsUsersReports::GeneratePdfJob.perform_later(campaigns_users_report, user) unless incomplete_assessment
      end
    end
  end
end
