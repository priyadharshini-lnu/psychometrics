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
          audit_score_submission_failure(score_data, result[:error])
          render json: { error: result[:error] }, status: :unauthorized
        else
          audit_score_submission_success(score_data, result[:user_assessment])
          head :ok
        end
      rescue JSON::ParserError
        audit_invalid_json_error(request.body.read)
        render json: { error: 'Invalid JSON in request body' }, status: :bad_request
      end

      private

      def audit_score_submission_failure(score_data, error)
        AuditLogModule.audit!(:lti_ags_score_submission_failure, nil,
                              payload: score_data.merge(error: error))
      end

      def audit_score_submission_success(score_data, user_assessment)
        AuditLogModule.audit!(:lti_ags_score_submission_success, user_assessment,
                              campaign: user_assessment&.campaign,
                              payload: score_data)
      end

      def audit_invalid_json_error(request_body)
        AuditLogModule.audit!(:lti_ags_score_submission_invalid_json, nil,
                              payload: {
                                error: 'Invalid JSON in request body',
                                request_body: request_body.truncate(500)
                              })
      end
    end
  end
end
