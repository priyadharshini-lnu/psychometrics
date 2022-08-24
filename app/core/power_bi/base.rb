# frozen_string_literal: true

module PowerBi
  class Base < BaseCommand
    BASE_API_URL = "https://api.powerbi.com/v1.0/myorg"

    def config
      @config ||= Rails.application.secrets.power_bi
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
  end
end
