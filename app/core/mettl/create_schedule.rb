# frozen_string_literal: true

module Mettl
  class CreateSchedule < Base
    private_attr_reader :assessment, :project, :schedule_request

    def initialize(assessment, schedule_request = nil)
      @assessment = assessment
      @project = assessment.project
      @schedule_request = schedule_request || Mettl::BuildScheduleRequestBody.call!(assessment: assessment)
    end

    def call
      response = client.post(create_schedule_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise "Mettl::CreateSchedule failed for Assessment: #{assessment.id}. Error: #{result['error']['message']}"
      end

      mettl_user_assessment = save_mettl_schedule(result['createdSchedule'])

      broadcast :ok, mettl_user_assessment
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok
    end

    private

    def save_mettl_schedule(result)
      MettlScheduleRecord.create(
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
      schedule_request.to_json
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

    def mettl_assessment
      MettlAssessment.find_by(product_id: assessment.external_assessment_id)
    end
  end
end
