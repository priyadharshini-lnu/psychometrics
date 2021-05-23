# frozen_string_literal: true

module UserAssessments
  class Webhook
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.campaign.project
    end

    def publish_assessment_started
      data = {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
      WebhookSubscriptions::Publish.call!(project, :assessment_started, data)
    end

    def publish_assessment_completed
      data = {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
      WebhookSubscriptions::Publish.call!(project, :assessment_completed, data)
    end

    def publish_results_available
      user_assessment.user_reports.each do |user_report|
        next unless user_report.generatable?
        next if user_report.report.data_configuration.empty?

        built_results = ::Reports::BuildResults.call(user_report.report, user_report.user_results, true)[:ok]
        data = {
          campaign: user_assessment.campaign,
          subject: user_assessment.subject,
          report: user_report.report,
          results: Api::V1::ResultSerializer.new(built_results, user_report: user_report).to_h
        }
        WebhookSubscriptions::Publish.call!(project, :results_available, data)
      end
    end
  end
end
