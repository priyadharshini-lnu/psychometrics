# frozen_string_literal: true

module AI
  module Providers
    class Oci
      module Errors
        extend ActiveSupport::Concern

        def handle_oci_service_error(error)
          Rails.logger.error("OCI Generative AI Error: #{error}")

          error_message = extract_oci_error_message(error)

          case error.status_code
            when 400
              raise RubyLLM::BadRequestError.new(nil, error_message)
            when 401
              raise RubyLLM::UnauthorizedError.new(nil, error_message)
            when 403
              raise RubyLLM::ForbiddenError.new(nil, error_message)
            when 429
              raise RubyLLM::RateLimitError.new(nil, error_message)
            when 500
              raise RubyLLM::ServerError.new(nil, error_message)
            when 502, 503
              raise RubyLLM::ServiceUnavailableError.new(nil, error_message)
            when 529
              raise RubyLLM::OverloadedError.new(nil, error_message)
            else
              raise RubyLLM::Error.new(nil, error_message)
          end
        end

        def extract_oci_error_message(error)
          return "OCI Service Error: #{error.message}" if error.message.present?
          return "OCI Service Error (#{error.status_code})" if error.status_code.present?

          'OCI Service Error: Unknown error occurred'
        rescue StandardError
          'OCI Service Error: Unable to parse error message'
        end
      end
    end
  end
end
