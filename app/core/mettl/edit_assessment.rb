# frozen_string_literal: true

module Mettl
  class EditAssessment < Base
    include Rails.application.routes.url_helpers

    private_attr_reader :mettl_assessment, :project

    def initialize(mettl_assessment)
      @mettl_assessment = mettl_assessment
      @project = mettl_assessment.project
    end

    def call
      response = client.post(edit_assessment_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise "Mettl::EditAssessment failed for Assessment: #{mettl_assessment.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
      end

      broadcast :ok, result
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok, []
    end

    private

    def edit_assessment_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&as=#{encoded_request}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{request_data}\n#{timestamp}"
    end

    def request_data
      {
        exitRedirectionURL: assessment_redirect_url
      }.to_json
    end

    def encoded_request
      URI.encode_www_form_component(request_data)
    end

    def http_method
      'POST'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/assessments/#{mettl_assessment.product_id}/settings/edit"
    end

    def public_key
      config['public_key']
    end

    def assessment_redirect_url
      mettl_assessment_redirect_url(
        host: Settings.domain,
        subdomain: project.subdomain,
        protocol: Settings.protocol,
        port: Settings.port,
        mettl_assessment_id: mettl_assessment.id
      )
    end
  end
end
