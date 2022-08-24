# frozen_string_literal: true

module PowerBi
  class GetEmbedToken < Base
    private_attr_reader :dataset_id, :report_id, :identities

    def initialize(dataset_id, report_id, identities = {})
      @dataset_id = dataset_id
      @report_id = report_id
      @identities = identities
    end

    def call
      response = Faraday.post("#{BASE_API_URL}/GenerateToken", {
        reports: [{ id: report_id }],
        datasets: [{ id: dataset_id }],
        identities: [
          {
            roles: ['Self'],
            datasets: [dataset_id]
          }.merge(identities)
        ]
      }.to_json, {
        'Authorization': "Bearer #{get_access_token}",
        'Content-Type': 'application/json'
      })

      broadcast :ok, JSON.parse(response.body)['token']
    end
  end
end
