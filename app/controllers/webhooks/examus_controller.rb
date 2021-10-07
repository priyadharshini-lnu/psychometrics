# frozen_string_literal: true

module Webhooks
  class ExamusController < ::ApplicationController
    skip_before_action :authenticate_user!
    skip_before_action :verify_authenticity_token, only: %i[create]

    before_action :authenticate_request, only: %i[create]

    rescue_from Errors::JWTAuthError do |e|
      render json: { message: e.message }, status: :unauthorized
    end

    def create
      @proctoring_session&.update_attributes(results: params['examu'], completed_at: params['sessionEnd'])
      Examus::RecalculateCredits.call!(@proctoring_session)

      render json: 'OK', status: :ok
    end

    private

    def authenticate_request
      @proctoring_session = ::Examus::AuthorizeExamusRequest.call!(request.headers)
      render json: { error: 'Not Authorized' }, status: 401 unless @proctoring_session
    end

    def result_params
      params.permit!
    end
  end
end
