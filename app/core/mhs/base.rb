# frozen_string_literal: true

module Mhs
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    attr_reader :project

    def initialize(project)
      @project = project
    end

    def config
      project.mhs_config
    end

    def client
      @client ||= Faraday.new do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['Ocp-Apim-Subscription-Key'] = api_key
      end
    end

    def http_method
      raise NotImplementedError
    end

    def api_endpoint
      raise NotImplementedError
    end

    def api_key
      Settings.secrets.mhs.api_key
    end

    def api_base_url
      Settings.secrets.mhs.api_base_url
    end

    def assessment_settings
      @assessment_settings ||= Settings.providers.mhs.assessments.find { |m| m.id == measure_id }
    end

    def measure_id
      user_assessment.assessment.external_assessment_id
    end

    def mhs_user_assessment
      @mhs_user_assessment ||= user_assessment.mhs_user_assessment
    end
  end
end
