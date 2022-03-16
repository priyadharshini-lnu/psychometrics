# frozen_string_literal: true

module Iiht
  class Base < BaseCommand
    retry_on Faraday::UnauthorizedError, Faraday::ForbiddenError

    def initialize(project)
      @project = project
    end

    def client
      token = Iiht::GetAuthToken.call!(project)
      @client ||= Faraday.new(Settings.iiht.base_api_url) do |connection|
        connection.request :url_encoded
        connection.adapter Faraday.default_adapter
        connection.use Faraday::Response::RaiseError

        connection.headers['Accept'] = 'application/json'
        connection.headers['Content-Type'] = 'application/json'
        connection.headers['Authorization'] = "Bearer #{token}"
      end
    end

    def before_retry
      Iiht::GetAuthToken.clear_token(project)
    end

    def config
      project.iiht_config
    end

    def self.uniq_cache_key(project)
      md5_config = Digest::MD5.hexdigest(project.iiht_config.to_s)
      "#{project.id}/#{md5_config}/iiht"
    end

    def uniq_cache_key
      self.class.uniq_cache_key(project)
    end

    def project
      @project || user_assessment.project
    end
  end
end
