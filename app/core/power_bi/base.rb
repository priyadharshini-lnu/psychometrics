# frozen_string_literal: true

module PowerBi
  class Base < BaseCommand
    BASE_API_URL = 'https://api.powerbi.com/v1.0/myorg'

    def config
      @config ||= Settings.secrets.power_bi
    end

    def get_access_token
      response = Faraday.post("https://login.microsoftonline.com/#{config[:tenant_id]}/oauth2/token", {
        grant_type: 'client_credentials',
        client_id: config[:client_id],
        client_secret: config[:client_secret],
        resource: 'https://analysis.windows.net/powerbi/api'
      })
      JSON.parse(response.body)['access_token']
    end

    def post(path, body = nil)
      Faraday.post("#{BASE_API_URL}/#{path}", body&.to_json, auth_headers)
    end

    def get(path, body = nil)
      Faraday.get("#{BASE_API_URL}/#{path}", body, auth_headers)
    end

    def auth_headers
      {
        Authorization: "Bearer #{get_access_token}",
        'Content-Type': 'application/json'
      }
    end
  end
end
