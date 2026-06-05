# frozen_string_literal: true

module Webhooks
  class MicrositeController < ActionController::Base
    skip_before_action :verify_authenticity_token

    def auth
      user = find_user
      return head :unauthorized unless user

      unless user.active_for_authentication?
        return render json: { success: false, error: 'Account is disabled' },
                      status: :unauthorized
      end

      if user.valid_password?(payload['password'])
        render json: { success: true }
      else
        render json: { success: false, error: 'Invalid credentials' }, status: :unauthorized
      end
    end

    def results
      return head :unauthorized unless payload

      microsite_user_assessment = MicrositeUserAssessment.find_by(participant_id: payload['participant_id'])
      return head :not_found unless microsite_user_assessment

      Microsite::SaveAnswers.call!(
        microsite_user_assessment,
        raw_answers: payload['responses'],
        completed_at: payload['completedAt']
      )

      render json: { success: true }
    end

    private

    def find_user
      microsite_ua = MicrositeUserAssessment.find_by(participant_id: payload['participant_id'])
      user = microsite_ua&.subject
      user if user&.email&.casecmp?(payload['email'])
    rescue StandardError
      nil
    end

    def payload
      @payload ||= JWT.decode(params[:token], api_key, true, algorithm: 'HS256').first
    rescue JWT::DecodeError
      nil
    end

    def api_key
      @api_key ||= project&.integrations&.microsite&.first&.microsite_config&.dig('api_key')
    end

    def project
      @project ||= GetProjectBySubdomain.call!(request.subdomain)
    rescue StandardError
      nil
    end
  end
end
