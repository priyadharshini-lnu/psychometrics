# frozen_string_literal: true

# Signal raised on successful completion of a tool call by the assistant.

module AI
  module Utils
    class SuccessfulCompletionSignal < StandardError
      attr_reader :message, :data

      def initialize(message = 'Tool success signal: Execution completed successfully', data: nil)
        @message = message
        @data = data
        super(message)
      end
    end
  end
end
