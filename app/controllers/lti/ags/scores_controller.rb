# frozen_string_literal: true

module Lti
  module Ags
    class ScoresController < ActionController::Base
      skip_before_action :verify_authenticity_token

      def show
        head :ok
      end

      def create
        score_data = JSON.parse(request.body.read)

        result = Lti::Ags::ProcessScoreSubmission.call(score_data, request)

        if result[:error]
          render json: { error: result[:error] }, status: :unauthorized
        else
          head :ok
        end
      rescue JSON::ParserError
        render json: { error: 'Invalid JSON in request body' }, status: :bad_request
      end
    end
  end
end
