# frozen_string_literal: true

module Pearson
  class GetAssessments < Base
    def call
      data = Rails.cache.fetch('pearson/v1/products', expires_in: 1.day) do
        response = client.get('v1/products')
        ::JSON.parse(response.body)['data']
      end

      broadcast :ok, data
    end
  end
end
