# frozen_string_literal: true

module Pearson
  class GetAssessments < Base
    def call
      response = client.get('v1/products')

      broadcast :ok, ::JSON.parse(response.body)['data']
    end
  end
end
