# frozen_string_literal: true

module Mettl
  class EditAssessment < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :mettl_assessment, :project, :request_body

    def initialize(mettl_assessment, request_body)
      @mettl_assessment = mettl_assessment
      @request_body = request_body
      @project = mettl_assessment.project
    end

    def call
      response = client.post(edit_assessment_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise Mettl::Exceptions::EditAssessmentFailed,
              "Mettl::EditAssessment failed for Assessment: #{mettl_assessment.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
      end

      broadcast :ok, result
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok
    end

    private

    def edit_assessment_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&as=#{encoded_request}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{request_body.to_json}\n#{timestamp}"
    end

    def encoded_request
      URI.encode_www_form_component(request_body.to_json)
    end

    def http_method
      'POST'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/assessments/#{mettl_assessment.product_id}/settings/edit"
    end
  end
end
