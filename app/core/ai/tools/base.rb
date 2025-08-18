# frozen_string_literal: true

class AI::Tools::Base < RubyLLM::Tool
  class << self
    def interrupt_on_success_with_signal
      @interrupt_on_success_with_signal = true
    end

    def signals_on_success?
      @interrupt_on_success_with_signal || false
    end

    def max_retry_attempts(count)
      @max_retry_attempts = count
    end

    # Consecutive retries made by LLM, a success will reset this count
    def max_retries
      @max_retry_attempts || 3
    end
  end

  def self.method_added(method_name)
    return unless method_name == :execute
    return if @execute_wrapped

    @execute_wrapped = true
    original_execute = instance_method(:execute)

    define_method(:execute) do |**params|
      @retry_count ||= 0

      result = original_execute.bind_call(self, **params)

      if result.is_a?(Hash) && result.key?(:error)
        @retry_count += 1

        if @retry_count > self.class.max_retries
          raise AI::Tools::Errors::MaximumRetryAttemptsExceededError.new(
            self.class.name,
            @retry_count,
            self.class.max_retries,
            result[:error]
          )
        end

        # Return the error for potential retry by LLM
        return result
      else
        # Reset retry count on successful execution
        @retry_count = 0
      end

      handle_signal_on_success(result)
    end

    @execute_wrapped = false
  end

  private

  def handle_signal_on_success(result)
    if self.class.signals_on_success? && !(result.is_a?(Hash) && result.key?(:error))
      raise AI::Utils::SuccessfulCompletionSignal.
        new('Tool success signal: Execution completed successfully', data: result)
    end

    result
  end
end
