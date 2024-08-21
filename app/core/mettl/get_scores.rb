# frozen_string_literal: true

module Mettl
  class GetScores < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      return broadcast :ok, [] unless config

      begin
        response = client.get(result_url)

        result = JSON.parse(response.body)

        unless result['status'] == 'SUCCESS'
          raise "Mettl::GetScores failed for UserAssessment: #{user_assessment.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
        end
      rescue Faraday::Error => e
        Sentry.capture_exception(e, extra: { project_id: project.id })
        return broadcast :ok, []
      end

      broadcast :ok, result['candidate']
    end

    private

    def result_url
      timestamp = Time.now.to_i
      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{timestamp}"
    end

    def http_method
      'GET'
    end

    def api_endpoint
      "#{Settings.mettl.base_api_url}/v2/schedules/#{access_key}/candidates/#{mettl_user_assessment.email}"
    end

    def public_key
      config['public_key']
    end

    def mettl_user_assessment
      user_assessment.mettl_user_assessment
    end

    def access_key
      MettlSchedule.find_by(id: mettl_user_assessment.schedule_id)&.access_key
    end
  end
end
