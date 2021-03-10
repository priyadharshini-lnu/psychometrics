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
        Licenses::Use.call(campaign, user, report) if options[:use_license]
        user_report = UserReport.create_with(
          user_access: options[:user_access],
          report_family_id: options[:report_family_id]
        ).find_or_create_by!(campaign: campaign, report: report, user: user)

        user_assessments = report.assessments.map do |assessment|
          add_assessment_to_user(assessment, user_report)
        end
        generate_report_pdf(user_report)

        broadcast :ok,
                  user_report: user_report,
                  user_assessments: user_assessments
      end

      private

      def add_assessment_to_user(assessment, user_report)
        user_assessment = UserAssessment.find_by(
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          evaluator: user,
          relationship: Relationship.self_relationship
        )
        return user_assessment if user_assessment

        user_assessment = UserAssessment.create(
          users_result_id: user_result(assessment).id,
          campaign: campaign,
          assessment_id: assessment.id,
          subject: user,
          evaluator: user,
          relationship: Relationship.self_relationship
        )

        if assessment.hogan? && user.hogan_credential
          Hogan::AddReportsJob.perform_later(user_assessment, [user_report],
                                             user.hogan_credential, user.project)
        end
        user_assessment
      end

      def user_result(assessment)
        return create_new_user_result(assessment) if options[:operation] == 'add_and_allow_new_response'

        user_result = campaign_user.evaluation_results.order(created_at: :desc).find_by(assessment_id: assessment.id)

        return UsersResults::Copy.call!(user_result) if user_result

        create_new_user_result(assessment)
      end

      def create_new_user_result(assessment)
        user_result = UsersResult.create(
          assessment: assessment,
          subject_id: campaign_user.user_id,
          evaluator_id: campaign_user.user_id,
          answers: {}
        )

        if assessment.mindmill?
          user_result.create_mindmill_credential(
            user_name: "#{Settings.assigns.mindmill_prefix}_#{user_result.id}",
            password: SecureRandom.hex
          )
        end

        user_result
      end

      def generate_report_pdf(user_report)
        ::UserReports::GenerateAndSavePdfJob.perform_later(user_report, user)
      end
    end
  end
end
