# frozen_string_literal: true

module UserAssessments
  class Webhook
    private_attr_reader :user_assessment, :project, :webhook_id

    def initialize(user_assessment, webhook_id = nil)
      @user_assessment = user_assessment
      @project = user_assessment.campaign.project
      @webhook_id = webhook_id
    end

    def publish_assessment_started
      WebhookSubscriptions::Publish.call(
        project,
        :assessment_started,
        assessment_started_data,
        webhook_id: webhook_id,
        record: user_assessment
      )
    end

    def publish_assessment_completed
      WebhookSubscriptions::Publish.call(
        project,
        :assessment_completed,
        assessment_completed_data,
        webhook_id: webhook_id,
        record: user_assessment
      )
    end

    def publish_assessment_timeout
      WebhookSubscriptions::Publish.call(
        project,
        :assessment_timeout,
        assessment_timeout_data,
        webhook_id: webhook_id,
        record: user_assessment
      )
    end

    def publish_results_available
      user_assessment.user_reports.each do |user_report|
        next unless user_report.all_assessments_are_scored?
        next if user_report.report.data_configuration.empty?

        UserReports::Webhook.new(user_report).publish_reports_result_available
      end
    end

    def prepare_localized_webhook_data
      user_assessment.assessment.translations.each_with_object({}) do |translation, hash|
        hash[translation.locale] = {
          assessment: {
            id: translation.assessment_id,
            name: translation.name
          }
        }
      end
    end

    def assessment_started_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
    end

    def assessment_completed_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
    end

    def assessment_timeout_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject
      }
    end
  end
end
