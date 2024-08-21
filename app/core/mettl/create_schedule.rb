# frozen_string_literal: true

module Mettl
  class CreateSchedule < Base
    include Rails.application.routes.url_helpers

    DEFAULT_SCHEDULE_CONFIG = {
      'scheduleType' => 'AlwaysOn',
      'access' => {
        'type' => 'OpenForAll'
      },
      'sourceApp' => "lighthouse-#{ENV.fetch('REAL_ENV', 'dev')}"
    }.freeze

    private_attr_reader :assessment, :project

    def initialize(assessment)
      @assessment = assessment
      @project = assessment.project
    end

    def call
      response = client.post(create_schedule_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise "Mettl::CreateSchedule failed for Assessment: #{assessment.id}. Error: #{result['error']['message']}"
      end

      save_mettle_schedule(result['createdSchedule'])
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok, []
    end

    private

    def save_mettle_schedule(result)
      MettlSchedule.create(
        project_id: project.id,
        assessment_id: assessment.id,
        schedule_id: result['id'],
        schedule_name: result['name'],
        access_url: result['accessUrl'],
        access_key: result['accessKey']
      )
    end

    def create_schedule_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&sc=#{encoded_request}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{request_data}\n#{timestamp}"
    end

    def request_data
      schedule_config = DEFAULT_SCHEDULE_CONFIG.merge(
        name: "#{mettl_assessment.name} - #{assessment.id}",
        testFinishNotificationUrl: assessment_completion_notification_url,
        testGradedNotificationUrl: assessment_result_notification_url
      )

      schedule_config.to_json
    end

    def encoded_request
      URI.encode_www_form_component(request_data)
    end

    def http_method
      'POST'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/assessments/#{mettl_assessment.product_id}/schedules"
    end

    def public_key
      config['public_key']
    end

    def mettl_assessment
      MettlAssessment.find_by(product_id: assessment.external_assessment_id)
    end

    def assessment_completion_notification_url
      webhooks_mettl_completion_notification_url(
        project_id: project.id,
        host: Settings.domain,
        subdomain: assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end

    def assessment_result_notification_url
      webhooks_mettl_results_notification_url(
        project_id: project.id,
        host: Settings.domain,
        subdomain: assessment.project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port
      )
    end
  end
end
