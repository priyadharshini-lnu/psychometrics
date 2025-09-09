# frozen_string_literal: true

module AI
  module Tools
    module Errors
      class MaximumRetryAttemptsExceededError < StandardError
        attr_reader :tool_name, :attempt_count, :max_retries, :last_error_message

        def initialize(tool_name, attempt_count, max_retries, last_error_message = nil)
          @tool_name = tool_name
          @attempt_count = attempt_count
          @max_retries = max_retries
          @last_error_message = last_error_message
          super(build_message)
        end

        private

        def build_message
          message = "Tool '#{tool_name}' exceeded maximum retry attempts. " \
                    "Attempted #{attempt_count} times, maximum allowed: #{max_retries}"
          message += ". Last error: #{last_error_message}" if last_error_message
          message
        end
      end
    end
  end
end
