# frozen_string_literal: true

require 'rails_helper'

describe AI::WritingAssistance::ResultGenerator do
  let(:user) { create(:user) }
  let(:assistant) { create(:assistant, :writing_assistant) }
  let(:chat) { instance_double(AI::AssistantChat) }
  let(:text) { 'He dont like apples' }
  let(:operation) { 'fix_grammar' }

  let(:assistant_service) { instance_double(AI::AssistantService) }

  let(:valid_assistant_response) do
    {
      message: {
        'result' => "He doesn't like apples.",
        'suggestions' => ['He does not like apples.'],
        'what_changed_and_why' => 'Fixed grammar'
      },
      input_tokens: 100,
      output_tokens: 50
    }
  end

  before do
    allow(AI::Assistant).to receive_message_chain(:writing_assistant, :last).and_return(assistant)
    allow(assistant).to receive(:for_user).with(user).and_return(chat)
    allow(AI::AssistantService).to receive(:new).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:ok).and_yield(valid_assistant_response).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:error).and_return(assistant_service)
    allow(assistant_service).to receive(:call)
  end

  describe '#call' do
    context 'when operation is valid' do
      context 'with valid response' do
        let!(:valid_response) { valid_assistant_response[:message] }
        it 'returns success with result' do
          result = described_class.call!(user: user, text: text, operation: operation)
          expect(result).to eq(valid_response)
        end
      end

      context 'with invalid response missing result key' do
        let(:invalid_response) do
          {
            message: { 'suggestions' => [] },
            input_tokens: 100,
            output_tokens: 50
          }
        end

        before do
          allow(assistant_service).to receive(:on).with(:ok).and_yield(invalid_response).and_return(assistant_service)
        end

        it 'retries and eventually fails' do
          call_count = 0
          allow(assistant_service).to receive(:call) { call_count += 1 }

          error = nil
          described_class.new(user: user, text: text, operation: operation).
            on(:error) { |msg| error = msg }.
            call

          expect(call_count).to eq(3) # initial + 2 retries
          expect(error).to eq('Failed to generate valid output after multiple attempts')
        end
      end

      context 'with response that is not a hash' do
        let(:string_response) do
          {
            message: 'just a string',
            input_tokens: 100,
            output_tokens: 50
          }
        end

        before do
          allow(assistant_service).to receive(:on).with(:ok).and_yield(string_response).and_return(assistant_service)
        end

        it 'retries and fails' do
          error = nil
          described_class.new(user: user, text: text, operation: operation).
            on(:error) { |msg| error = msg }.
            call

          expect(error).to eq('Failed to generate valid output after multiple attempts')
        end
      end

      context 'with translate operation' do
        let(:operation) { 'translate' }
        let(:options) { { language: 'Spanish' } }
        let(:valid_response) do
          {
            message: { 'result' => 'A él no le gustan las manzanas' },
            input_tokens: 100,
            output_tokens: 50
          }
        end

        it 'includes language in prompt' do
          expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
            expect(prompt).to include('Spanish')
            assistant_service
          end

          described_class.new(user: user, text: text, operation: operation, options: options).call
        end
      end
    end

    context 'when operation is invalid' do
      let(:operation) { 'invalid_operation' }
      let(:valid_response) { {} }

      it 'returns error' do
        error = nil
        described_class.new(user: user, text: text, operation: operation).
          on(:error) { |msg| error = msg }.
          call

        expect(error).to include('Unknown operation invalid_operation')
      end
    end

    context 'when assistant is not configured' do
      let(:valid_response) { {} }

      before do
        allow(AI::Assistant).to receive_message_chain(:writing_assistant, :last).and_return(nil)
      end

      it 'raises error' do
        error = nil
        described_class.new(user: user, text: text, operation: operation).
          on(:error) { |msg| error = msg }.
          call

        expect(error).to eq('Writing Assistant not configured')
      end
    end
  end
end
