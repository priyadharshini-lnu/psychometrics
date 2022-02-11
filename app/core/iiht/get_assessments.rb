# frozen_string_literal: true

module Iiht
  class GetAssessments < Base
    def call
      data = Rails.cache.fetch("#{uniq_cache_key}/testListContent", expires_in: 1.days) do
        response = client.get('testlistContent', { companyId: config['company_id'] })

        ::JSON.parse(response.body).dig('data', 'tests')
      end

      broadcast :ok, data
    end
  end
end
