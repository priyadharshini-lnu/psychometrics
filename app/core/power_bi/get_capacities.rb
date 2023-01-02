# frozen_string_literal: true

module PowerBi
  class GetCapacities < Base
    def call
      response = get('capacities')

      broadcast :ok, JSON.parse(response.body)['value']
    end
  end
end
