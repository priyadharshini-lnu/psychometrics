# frozen_string_literal: true

module PowerBi
  class GetEmbedToken < BaseCommand
    private_attr_reader :dataset_id, :report_id, :identities

    def initialize(dataset_id, report_id, identities = {})
      @dataset_id = dataset_id
      @report_id = report_id
      @identities = identities
    end

    def call
      access_token = get_access_token
      response = Faraday.post('https://api.powerbi.com/v1.0/myorg/GenerateToken', {
        reports: [{ id: report_id }],
        datasets: [{ id: dataset_id }],
        identities: [
          {
            roles: ['Self'],
            datasets: [dataset_id]
          }.merge(identities)
        ]
      }.to_json, {
        'Authorization': "Bearer #{access_token}",
        'Content-Type': 'application/json'
      })

      broadcast :ok, JSON.parse(response.body)['token']
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

    def config
      @config ||= Rails.application.secrets.power_bi
    end
  end
end
