# frozen_string_literal: true

module Mettl
  class DeleteCandidateResult < Base
    private_attr_reader :user_assessment, :project

    def initialize(user_assessment)
      @user_assessment = user_assessment
      @project = user_assessment.project
    end

    def call
      response = client.delete(delete_candidate_result_url)

      result = ::JSON.parse(response.body)

      unless result['status'] == 'SUCCESS'
        raise Mettl::Exceptions::DeleteCandidateResultFailed,
              "Mettl::DeleteCandidateResult failed for UserAssessment: #{user_assessment.id}. Error: #{result['error']['message']}" # rubocop:disable Layout/LineLength
      end

      user_assessment.mettl_user_assessment.update!(url: nil)
    rescue StandardError => e
      Sentry.capture_exception(e, extra: {
        user_assessment_id: user_assessment.id, project_id: project.id
      })
      broadcast :ok
    end

    private

    def delete_candidate_result_url
      timestamp = Time.now.to_i

      signature = Mettl::GetSignature.call!(config, string_to_sign(timestamp))

      "#{api_endpoint}?ak=#{public_key}&ts=#{timestamp}&asgn=#{signature}"
    end

    def string_to_sign(timestamp)
      "#{http_method}#{api_endpoint}\n#{public_key}\n#{timestamp}"
    end

    def http_method
      'DELETE'
    end

    def api_endpoint
      "#{api_base_url}/v2/schedules/#{access_key}/candidates/#{mettl_user_assessment.email}"
    end

    def mettl_user_assessment
      @mettl_user_assessment ||= user_assessment.mettl_user_assessment
    end

    def access_key
      MettlScheduleRecord.find_by(id: mettl_user_assessment.mettl_schedule_record_id)&.access_key
    end
  end
end
