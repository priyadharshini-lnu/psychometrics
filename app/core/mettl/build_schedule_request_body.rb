# frozen_string_literal: true

module Mettl
  class BuildScheduleRequestBody < BaseCommand
    include Rails.application.routes.url_helpers

    DEFAULT_SCHEDULE_CONFIG = {
      'sourceApp' => "lighthouse-#{ENV.fetch('REAL_ENV', 'dev')}",
      'access' => {
        'type' => 'OpenForAll'
      },
      'scheduleType' => 'AlwaysOn'
    }.freeze

    attr_reader :assessment, :schedule_name, :proctoring_enabled, :secure_browser_enabled

    def initialize(assessment:, attributes: {})
      @assessment = assessment
      @schedule_name = attributes[:schedule_name]
      @proctoring_enabled = attributes[:proctoring_enabled]
      @secure_browser_enabled = attributes[:secure_browser_enabled]
    end

    def call
      broadcast :ok, schedule_config
    end

    private

    def schedule_config
      DEFAULT_SCHEDULE_CONFIG.merge(
        'name' => schedule_name || default_schedule_name,
        'webProctoring' => { 'enabled' => proctoring_enabled },
        'secureBrowser' => { 'enabled' => secure_browser_enabled },
        'testFinishNotificationUrl' => assessment_completion_notification_url,
        'testGradedNotificationUrl' => assessment_result_notification_url
      )
    end

    def default_schedule_name
      "#{mettl_assessment.name} - #{ENV.fetch('SERVER_NAME', 'dev')} - #{assessment.id}"
    end

    def mettl_assessment
      MettlAssessment.find_by(product_id: assessment.external_assessment_id)
    end

    def assessment_completion_notification_url
      Rails.application.routes.url_helpers.webhooks_mettl_completion_notification_url(
        project_id: assessment.project.id,
        host: Settings.domain,
        subdomain: assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end

    def assessment_result_notification_url
      Rails.application.routes.url_helpers.webhooks_mettl_results_notification_url(
        project_id: assessment.project.id,
        host: Settings.domain,
        subdomain: assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end
  end
end
