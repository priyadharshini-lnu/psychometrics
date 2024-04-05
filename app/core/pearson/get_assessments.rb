# frozen_string_literal: true

module Pearson
  class GetAssessments < Base
    def call
      response = client.get('v1/products?pageSize=100000')

      broadcast :ok, ::JSON.parse(response.body)['data']
    end
  end
end
