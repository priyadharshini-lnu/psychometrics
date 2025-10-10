# frozen_string_literal: true

module AI
  module Concerns
    module ErrorHandler
      extend ActiveSupport::Concern

      private

      # rubocop:disable Metrics/CyclomaticComplexity
      def handle_assistant_error_response(error_message, error_object)
        error_meta = {
          error: error_message,
          error_class: error_object&.class&.name
        }

        status_code = nil
        if error_object.respond_to?(:response) && error_object.response
          status_code = error_object.response.status
          error_meta[:status_code] = status_code
          error_meta[:response_body] = error_object.response.body if error_object.response.body
        end

        error_response = case status_code
                           when 400
                             I18n.t('ai.errors.bad_request_invalid_input')
                           when 429
                             I18n.t('ai.errors.rate_limit_exceeded')
                           when 500
                             I18n.t('ai.errors.server_error')
                           when 502, 503
                             I18n.t('ai.errors.service_unavailable')
                           when 529
                             I18n.t('ai.errors.service_overloaded')
                           else
                             I18n.t('ai.errors.generic')
                         end

        [error_response, error_meta]
      end
      # rubocop:enable Metrics/CyclomaticComplexity
    end
  end
end
