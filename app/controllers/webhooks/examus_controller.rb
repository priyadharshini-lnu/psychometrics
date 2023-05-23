# frozen_string_literal: true

module Webhooks
  class ExamusController < ActionController::Base
    skip_before_action :verify_authenticity_token

    rescue_from Errors::JwtAuthError do |e|
      raise "Examus webhook error: #{e.message}. Params: #{params}"
    end

    def create
      ::Examus::AuthorizeExamusRequest.call!(request.headers)
      data = JSON.parse(request.raw_post)
      proctoring_session = ProctoringSession.find_by!(session_id: data['sessionId'])
      proctoring_session&.update(
        results: data.slice('archive', 'conclusion', 'comment', 'score', 'reportUrl', 'warnings'),
        completed_at: data['sessionEnd'],
        started_at: data['sessionStart']
      )
      Examus::RecalculateCredits.call!(proctoring_session)

      render json: 'OK', status: :ok
    end

    private

    def result_params
      params.permit(:archive, :conclusion, :comment, :score)
    end
  end
end
