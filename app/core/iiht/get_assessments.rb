# frozen_string_literal: true

module Iiht
  class GetAssessments < Base
    private_attr_reader :force

    MAX_RESULT_COUNT = 100

    def initialize(project, force: false)
      super(project)
      @force = force
    end

    def call
      return broadcast :ok, [] unless config

      begin
        data = Rails.cache.fetch(cache_key, expires_in: 1.day, race_condition_ttl: 1.minute, force: force) do
          load_assessments
        end
      rescue Faraday::Error => e
        Sentry.capture_exception(e, extra: { project_id: project.id })
        return broadcast :ok, []
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
      assessments.concat(new_assessments)

      return assessments.sort_by { |a| a['name'] } if new_assessments.empty? || assessments.count == data['totalCount']

      load_assessments(assessments, skip_count + MAX_RESULT_COUNT)
    end

    def cache_key
      "#{uniq_cache_key}/GetAssessments"
    end
  end
end
