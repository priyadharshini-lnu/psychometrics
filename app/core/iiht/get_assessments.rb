# frozen_string_literal: true

module Iiht
  class GetAssessments < Base
    MAX_RESULT_COUNT = 100

    def call
      data = Rails.cache.fetch("#{uniq_cache_key}/GetAssessments", expires_in: 1.days) do
        load_assessments
      end

      broadcast :ok, data
    end

    private

    def load_assessments(assessments = [], skip_count = 0)
      response = client.get(
        'GetAssessments',
        { tenantId: config['tenant_id'], maxResultCount: MAX_RESULT_COUNT, skipCount: skip_count }
      )
      data = ::JSON.parse(response.body)['result']
      new_assessments = data['assessments'].map { |a| a.slice('name', 'assessmentIdNumber', 'description') }
      assessments = assessments.concat(new_assessments)

      return assessments.sort_by { |a| a['name'] } if new_assessments.empty? || assessments.count == data['totalCount']

      load_assessments(assessments, skip_count + MAX_RESULT_COUNT)
    end
  end
end
