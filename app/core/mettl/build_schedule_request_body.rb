# frozen_string_literal: true

module Mettl
  class BuildScheduleRequestBody < BaseCommand
    include Rails.application.routes.url_helpers

    DEFAULT_SCHEDULE_CONFIG = {
      'access' => {
        'type' => 'OpenForAll'
      },
      'scheduleType' => 'AlwaysOn'
    }.freeze

    attr_reader :assessment, :schedule_name, :secure_browser_enabled, :visual_proctoring_settings,
                :web_proctoring_settings

    def initialize(assessment:, attributes: {})
      @assessment = assessment
      @schedule_name = attributes[:schedule_name]
      @secure_browser_enabled = attributes[:secure_browser_enabled]
      @visual_proctoring_settings = attributes[:visual_proctoring_settings] || {}
      @web_proctoring_settings = attributes[:web_proctoring_settings] || {}
    end

    def call
      broadcast :ok, schedule_config
    end

    private

    def schedule_config
      DEFAULT_SCHEDULE_CONFIG.merge(
        'sourceApp' => source_app,
        'name' => schedule_name || default_schedule_name,
        'secureBrowser' => { 'enabled' => secure_browser_enabled },
        'webProctoring' => {
          'enabled' => web_proctoring_settings[:enabled] || false,
          'count' => web_proctoring_settings[:count] || 0,
          'showRemainingCounts' => web_proctoring_settings[:show_remaining_counts] || false
        },
        'visualProctoring' => {
          'mode' => visual_proctoring_settings[:enabled] ? 'PHOTO' : 'OFF',
          'options' => {
            'candidateScreenCapture' => visual_proctoring_settings[:candidate_screen_capture] || false,
            'candidateAuthorization' => visual_proctoring_settings[:candidate_authorization] || false
          }
        },
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

    def source_app
      ENV.fetch('REAL_ENV', 'local').starts_with?('production') ? 'lighthouse-production' : 'lighthouse-testing'
    end
  end
end
