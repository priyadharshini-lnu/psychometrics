# frozen_string_literal: true

module Webhooks
  class MettlController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def completion_notification
      user_assessment = find_user_assessment_from_request

      return head :ok unless user_assessment

      user_assessment.complete! unless user_assessment&.completed?

      head :ok
    end

    def results
      user_assessment = find_user_assessment_from_request

      return head :ok unless user_assessment

      user_assessment.complete! unless user_assessment&.completed?

      ::Mettl::SaveScoresAndReport.call!(user_assessment, JSON.parse(request.raw_post))

      head :ok
    end

    private

    def find_user_assessment_from_request
      response = JSON.parse(request.raw_post)

      jwt_token = JSON.parse(response['context_data'])['token']

      begin
        user_assessment_id = JWT.decode(jwt_token, Settings.secrets.webhook_jwt_secret).dig(0, 'data')
        UserAssessment.find_by(id: user_assessment_id) if user_assessment_id
      rescue JWT::DecodeError, JWT::ExpiredSignature => e
        Rails.logger.error("JWT Error: #{e.message}")
        nil
      end
    end
  end
end
