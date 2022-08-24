# frozen_string_literal: true

module PowerBi
  class RefreshDataset < Base
    private_attr_reader :dataset_id, :identities

    def initialize(dataset_id)
      @dataset_id = dataset_id
    end

    def call
      url = "#{BASE_API_URL}/groups/#{config[:tenant_id]}/datasets/#{dataset_id}/refreshes"
      response = Faraday.post(
        "#{BASE_API_URL}/groups/#{config[:tenant_id]}/datasets/#{dataset_id}/refreshes",
        {}.to_json,
        {
          'Authorization': "Bearer #{get_access_token}",
          'Content-Type': 'application/json'
        }
      )
      unless (200...300).cover?(response.status)
        raise PowerBi::RefreshFailedError, JSON.parse(response.body).dig('error', 'message')
      end

      broadcast :ok
    end
  end
end
