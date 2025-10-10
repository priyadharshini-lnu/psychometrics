# frozen_string_literal: true

require 'rails_helper'

# Test tool class without configuration
class TestTool < AI::Tools::Base
  def execute(message:)
    { result: "Hello #{message}" }
  end
end

# Test tool with error results
class ErrorTool < AI::Tools::Base
  def initialize(error_message = 'Test error')
    @error_message = error_message
  end

  def execute(*)
    { error: @error_message }
  end
end

# Test tool with success signal
class SignalTool < AI::Tools::Base
  interrupt_on_success_with_signal

  def execute(message:)
    { result: "Success: #{message}" }
  end
end

# Test tool with custom retry configuration
class RetryTool < AI::Tools::Base
  max_retry_attempts 2
  raise_error_on_maximum_retry

  def initialize
    @should_fail = true
    @call_count = 0
  end

  def execute(*)
    @call_count += 1

    if @should_fail
      { error: "Attempt #{@call_count} failed" }
    else
      { result: "Success after #{@call_count} attempts" }
    end
  end

  def succeed_next!
    @should_fail = false
  end

  def fail_next!
    @should_fail = true
  end
end

# Test tool that raises ArgumentError
class ArgumentErrorTool < AI::Tools::Base
  def execute(*)
    raise ArgumentError, 'Invalid parameter provided'
  end
end

describe AI::Tools::Base do
  describe 'class methods' do
    describe '.interrupt_on_success_with_signal' do
      it 'enables success signal flag' do
        expect(SignalTool.signals_on_success?).to be true
      end
    end

    describe '.signals_on_success?' do
      it 'returns false by default' do
        expect(TestTool.signals_on_success?).to be false
      end
    end

    describe '.raise_error_on_maximum_retry' do
      it 'enables error raising on max retry' do
        expect(RetryTool.raise_error_on_maximum_retry_enabled?).to be true
      end

      it 'returns false by default' do
        expect(TestTool.raise_error_on_maximum_retry_enabled?).to be false
      end
    end
  end

  describe '#execute' do
    context 'successful execution' do
      let(:tool) { TestTool.new }

      it 'returns result without retry' do
        result = tool.execute(message: 'World')
        expect(result).to eq({ result: 'Hello World' })
      end

      it 'resets retry count on success' do
        tool = RetryTool.new

        # First failure (retry count: 1)
        result = tool.execute(message: 'test')
        expect(result[:error]).to eq('Attempt 1 failed')

        # Second failure (retry count: 2)
        result = tool.execute(message: 'test')
        expect(result[:error]).to eq('Attempt 2 failed')

        # Third attempt succeeds (retry count should reset to 0)
        tool.succeed_next!
        result = tool.execute(message: 'test')
        expect(result[:result]).to eq('Success after 3 attempts')

        # Now make it fail again - retry count should start from 0
        tool.fail_next!
        result = tool.execute(message: 'test')
        expect(result[:error]).to eq('Attempt 4 failed')

        # This should still be within retry limit (not raise exception)
        result = tool.execute(message: 'test')
        expect(result[:error]).to eq('Attempt 5 failed')

        # Only now on the third consecutive failure should it raise
        expect do
          tool.execute(message: 'test')
        end.to raise_error(AI::Tools::Errors::MaximumRetryAttemptsExceededError)
      end
    end

    context 'with success signal enabled' do
      let(:tool) { SignalTool.new }

      it 'raises SuccessfulCompletionSignal on success' do
        expect do
          tool.execute(message: 'World')
        end.to raise_error(AI::Utils::SuccessfulCompletionSignal) do |signal|
          expect(signal.data).to eq({ result: 'Success: World' })
          expect(signal.message).to eq('Tool success signal: Execution completed successfully')
        end
      end

      it 'does not raise signal for error results' do
        error_tool = ErrorTool.new
        error_tool.class.interrupt_on_success_with_signal

        result = error_tool.execute(message: 'test')
        expect(result).to eq({ error: 'Test error' })
      end
    end

    context 'error handling and retries' do
      let(:tool) { ErrorTool.new('Recoverable errors') }

      it 'returns error without raising exception by default' do
        result = tool.execute(message: 'test')
        expect(result).to eq({ error: 'Recoverable errors' })
      end

      it 'tracks retry attempts' do
        3.times { tool.execute(message: 'test') }

        result = tool.execute(message: 'test')
        expect(result[:error]).to include('exceeded maximum retry attempts')
      end
    end

    context 'maximum retry attempts exceeded' do
      context 'with raise_error_on_maximum_retry disabled' do
        let(:tool) { ErrorTool.new('Persistent error') }

        it 'returns error message instead of raising exception' do
          4.times { tool.execute(message: 'test') }

          result = tool.execute(message: 'test')
          expect(result[:error]).to include('exceeded maximum retry attempts')
        end
      end

      context 'with raise_error_on_maximum_retry enabled' do
        let(:tool) { RetryTool.new } # Will always generate recoverable error by default

        it 'raises MaximumRetryAttemptsExceededError' do
          2.times { tool.execute(message: 'test') }

          expect do
            tool.execute(message: 'test')
          end.to raise_error(AI::Tools::Errors::MaximumRetryAttemptsExceededError)
        end
      end
    end

    context 'ArgumentError handling' do
      let(:tool) { ArgumentErrorTool.new }

      it 'catches ArgumentError and returns error hash' do
        result = tool.execute(invalid_param: 'test')

        expect(result[:error]).to eq('ArgumentError: Invalid parameter provided')
      end
    end
  end
end
