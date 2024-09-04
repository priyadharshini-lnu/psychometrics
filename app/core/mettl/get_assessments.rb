# frozen_string_literal: true

module Mettl
  class GetAssessments < Base
    DEFAULT_LIMIT = 100

    def call
      return broadcast :ok, [] unless config

      begin
        data = fetch_all_assessments
      rescue Faraday::Error => e
        Sentry.capture_exception(e, extra: { project_id: project.id })
        return broadcast :ok, []
      end

      broadcast :ok, data
    end

    private

    def fetch_all_assessments
      initial_response = fetch_assessments(offset: 0, limit: DEFAULT_LIMIT)
      assessments = initial_response['assessments']
      total_count = initial_response.dig('paging', 'totalRecords').to_i

      return assessments if total_count <= DEFAULT_LIMIT

      fetch_remaining_assessments(assessments, total_count)
    end

    def fetch_remaining_assessments(assessments, total_count)
      remaining_requests = ((total_count - DEFAULT_LIMIT) / DEFAULT_LIMIT.to_f).ceil

      (1..remaining_requests).each do |page|
        offset = page * DEFAULT_LIMIT
        response = fetch_assessments(offset: offset, limit: DEFAULT_LIMIT)
        assessments.concat(response['assessments'])
      end

      assessments
    end

    def fetch_assessments(offset:, limit:)
      response = client.get(assessments_url(offset: offset, limit: limit))
      JSON.parse(response.body)
    end

    def assessments_url(offset:, limit:)
      timestamp = Time.now.to_i
      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp, limit, offset))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&limit=#{limit}&offset=#{offset}"
    end

    def string_to_sign(timestamp, limit, offset)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{limit}\n#{offset}\n#{timestamp}"
    end

    def http_method
      'GET'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/assessments"
    end
  end
end
