# frozen_string_literal: true

module UserReports
  class Webhook
    private_attr_reader :user_report, :project, :webhook_id, :user_result

    def initialize(user_report, webhook_id = nil)
      @user_report = user_report
      @project = user_report.campaign.project
      @webhook_id = webhook_id
      @user_result = user_report.user_results.first
    end

    def publish_report_available
      return if user_result.nil?

      WebhookSubscriptions::Publish.call!(project, :report_available, report_available_data)
    end

    def report_available_data
      return {} if user_result.nil?

      campaign = user_result.user_assessment.campaign

      {
        campaign: campaign,
        subject: user_result.subject,
        report: user_report.report,
        user_report: user_report
      }
    end

    def publish_reports_result_available
      WebhookSubscriptions::Publish.call(
        project, :results_available, result_available_data, webhook_id
      )
    end

    def result_available_data
      built_results = ::Reports::BuildResults.call!(user_report.report, user_report.user_results)

      {
        campaign: user_report.campaign,
        subject: user_report.subject,
        report: user_report.report,
        results: Api::V1::ResultSerializer.new(built_results, user_report: user_report).to_h
      }
    end
  end
end
