# frozen_string_literal: true

module Webhooks
  class SimulationController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def progress_notification
      user_assessment = find_user_assessment_from_request

      return head :ok unless user_assessment

      response = JSON.parse(request.raw_post)

      update_user_assessment_progress(user_assessment, response) if response['progress']

      if response['event'] == 'decisions_available'
        Simulation::SaveScoresAndReport.call!(user_assessment, response)
      end

      head :ok
    end

    private

    def find_user_assessment_from_request
      token = params[:jwt_token]
      decoded_token = JWT.decode(token, Settings.secrets.webhook_jwt_secret, true, { algorithm: 'HS256' })
      user_assessment_id = decoded_token&.dig(0, 'data')

      UserAssessment.find_by(id: user_assessment_id) if user_assessment_id
    rescue JWT::DecodeError, JWT::ExpiredSignature => e
      Rails.logger.error("JWT Error: #{e.message}")
      nil
    end

    def update_user_assessment_progress(user_assessment, response)
      progress = response['progress']

      progress_percentage = (progress * 100).round
      user_assessment.users_result.update!(progress: progress_percentage)

      user_assessment.complete! if progress_percentage == 100 && !user_assessment.completed?
    end
  end
end
