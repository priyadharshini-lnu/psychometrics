# frozen_string_literal: true

# Signal raised on successful completion of a tool call by the assistant.

class AI::Utils::SuccessfulCompletionSignal < StandardError
  attr_reader :message, :data

  def initialize(message = 'Tool success signal: Execution completed successfully', data: nil)
    @message = message
    @data = data
    super(message)
  end
end
