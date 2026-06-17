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

    def publish_assessment_assigned
      WebhookSubscriptions::Publish.call(
        project,
        :assessment_assigned,
        assessment_assigned_data,
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

    def publish_assessment_raw_response
      WebhookSubscriptions::Publish.call(
        project,
        :assessment_raw_response,
        assessment_raw_response_data,
        webhook_id: webhook_id,
        record: user_assessment
      )
    end

    def publish_campaign_user_assessment_summary
      WebhookSubscriptions::Publish.call(
        project,
        :campaign_user_assessment_summary,
        campaign_user_assessment_summary_data,
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
        subject: user_assessment.subject,
        event_time: user_assessment.started_at
      }
    end

    def assessment_completed_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject,
        event_time: user_assessment.completed_at
      }
    end

    def assessment_timeout_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject,
        event_time: user_assessment.last_activity_at
      }
    end

    def assessment_assigned_data
      {
        campaign: user_assessment.campaign,
        assessment: user_assessment.assessment,
        evaluator: user_assessment.evaluator,
        subject: user_assessment.subject,
        event_time: user_assessment.created_at
      }
    end

    def assessment_raw_response_data
      Webhooks::AssessmentRawResponsePayload.new(user_assessment).call
    end

    private

    def campaign_user_assessment_summary_data
      subject_assessments = UserAssessment.
                            self_assessment.
                            where(campaign_id: user_assessment.campaign_id, subject_id: user_assessment.subject_id).
                            left_joins(assessment: :tags).
                            select(
                              'user_assessments.assessment_id',
                              'assessments.name as assessment_name',
                              'user_assessments.status',
                              'ARRAY_AGG(tags.name) as tags'
                            ).
                            group(:id, :assessment_name, :status).
                            map do |ua|
                              {
                                id: ua.assessment_id, name: ua.assessment_name, status: ua.status,
                                tags: ua.tags.compact
                              }
                            end
      {
        campaign: user_assessment.campaign,
        subject: user_assessment.subject,
        event_time: Time.current,
        assessments: subject_assessments
      }
    end
  end
end
