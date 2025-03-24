# frozen_string_literal: true

module Mettl
  class EditSchedule < Base
    private_attr_reader :mettl_schedule_record, :project, :schedule_request

    def initialize(mettl_schedule_record, schedule_request = nil)
      @mettl_schedule_record = mettl_schedule_record
      @schedule_request = schedule_request
      @project = mettl_schedule_record.project
    end

    def call
      response = client.post(edit_schedule_url)

      result = ::JSON.parse(response.body)
      unless result['status'] == 'SUCCESS'
        raise Mettl::Exceptions::EditScheduleFailed,
              "Mettl::EditSchedule failed for Schedule: #{mettl_schedule_record.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
      end

      broadcast :ok, result
    rescue Faraday::Error => e
      Sentry.capture_exception(e, extra: { project_id: project.id })
      broadcast :ok
    end

    private

    def edit_schedule_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}&sc=#{encoded_request}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{request_data}\n#{timestamp}"
    end

    def request_data
      schedule_request.to_json
    end

    def encoded_request
      URI.encode_www_form_component(request_data)
    end

    def http_method
      'POST'
    end

    def api_endpoint
      "#{api_base_url}/v2/schedules/#{mettl_schedule_record.access_key}/edit"
    end
  end
end
