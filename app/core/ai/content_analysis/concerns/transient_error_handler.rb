# frozen_string_literal: true

module AI
  module ContentAnalysis
    module Concerns
      module TransientErrorHandler
        extend ActiveSupport::Concern

        TRANSIENT_ERRORS = [
          RubyLLM::RateLimitError,
          RubyLLM::ServerError,
          RubyLLM::ServiceUnavailableError,
          RubyLLM::OverloadedError,
          OCI::Errors::NetworkError
        ].freeze

        def transient_error?(exception)
          return false unless exception

          TRANSIENT_ERRORS.any? { |klass| exception.is_a?(klass) }
        end

        class_methods do
          def transient_errors
            TRANSIENT_ERRORS
          end
        end
      end
    end
  end
end
