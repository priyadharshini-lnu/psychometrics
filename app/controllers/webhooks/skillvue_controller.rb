# frozen_string_literal: true

module Webhooks
  class SkillvueController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def completion_notification
      response = parse_json_payload
      return head :unprocessable_entity unless response

      user_assessment = find_user_assessment_from_response(response)

      return head :ok unless user_assessment

      if response['type'] == 'assessment.completed' && !user_assessment.completed?
        user_assessment.complete!
      end

      head :ok
    end

    def results
      response = parse_json_payload
      return head :unprocessable_entity unless response

      user_assessment = find_user_assessment_from_response(response)

      return head :ok unless user_assessment

      if response['type'] == 'report.ready'
        user_assessment.complete! unless user_assessment.completed?
        Skillvue::SaveScoresAndReport.call!(user_assessment, response)
      end

      head :ok
    end

    private

    def parse_json_payload
      JSON.parse(request.raw_post)
    rescue JSON::ParserError => e
      Rails.logger.error("Invalid JSON payload received: #{e.message}")
      nil
    end

    def find_user_assessment_from_response(response)
      encoded_user_assessment_id = response['userId']

      UserAssessment.find_by_encoded_id(encoded_user_assessment_id) if encoded_user_assessment_id # rubocop:disable Rails/DynamicFindBy
    rescue Hashids::InputError, ActiveRecord::RecordNotFound
      Rails.logger.error("Invalid userId in response: #{encoded_user_assessment_id}")
      nil
    end
  end
end
