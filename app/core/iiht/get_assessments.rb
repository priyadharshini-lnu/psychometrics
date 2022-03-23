# frozen_string_literal: true

module Iiht
  class GetAssessments < Base
    def call
      data = Rails.cache.fetch("#{uniq_cache_key}/GetAssessments", expires_in: 1.days) do
        response = client.get('GetAssessments', { tenantId: config['tenant_id'] })

        data = ::JSON.parse(response.body).dig('result', 'assessments').map do |assessment|
          assessment.slice('name', 'assessmentIdNumber', 'description')
        end
      end

      broadcast :ok, data
    end
  end
end
