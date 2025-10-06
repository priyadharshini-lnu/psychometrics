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

    def raise_error_on_maximum_retry
      @raise_error_on_maximum_retry = true
    end

    def raise_error_on_maximum_retry_enabled?
      @raise_error_on_maximum_retry || false
    end
  end

  def self.method_added(method_name)
    return unless method_name == :execute
    return if @execute_wrapped

    @execute_wrapped = true
    original_execute = instance_method(:execute)

    define_method(:execute) do |**params|
      execute_with_retry_logic(original_execute, **params)
    end

    @execute_wrapped = false
  end

  private

  def execute_with_retry_logic(original_execute, **params)
    @retry_count ||= 0
    result = original_execute.bind_call(self, **params)

    if error_result?(result)
      handle_error_result(result)
    else
      handle_successful_result(result)
    end
  rescue ArgumentError => e
    # This is the case when LLM provides invalid arguments to the tool
    # This could be by enforcing rules in system prompt
    # this can be recovered by returning the error message for potential retry by LLM
    { error: "ArgumentError: #{e.message}" }
  end

  def error_result?(result)
    result.is_a?(Hash) && result.key?(:error)
  end

  def handle_error_result(result)
    @retry_count += 1

    if @retry_count > self.class.max_retries
      handle_maximum_retries_exceeded(result)
    else
      # Return the error for potential retry by LLM
      result
    end
  end

  def handle_maximum_retries_exceeded(result)
    error = AI::Tools::Errors::MaximumRetryAttemptsExceededError.new(
      self.class.name,
      @retry_count,
      self.class.max_retries,
      result[:error]
    )

    if self.class.raise_error_on_maximum_retry_enabled?
      raise error
    else
      { error: error.message }
    end
  end

  def handle_successful_result(result)
    # Reset retry count on successful execution
    @retry_count = 0
    handle_signal_on_success(result)
  end

  def handle_signal_on_success(result)
    if self.class.signals_on_success? && !(result.is_a?(Hash) && result.key?(:error))
      raise AI::Utils::SuccessfulCompletionSignal.
        new('Tool success signal: Execution completed successfully', data: result)
    end

    result
  end
end
