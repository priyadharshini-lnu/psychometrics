# frozen_string_literal: true

require 'rails_helper'

describe AI::WritingAssistance::ResultGenerator do
  let(:user) { create(:user) }
  let(:assistant) { create(:assistant, :writing_assistant) }
  let(:chat) { instance_double(AI::AssistantChat) }
  let(:text) { 'He dont like apples' }
  let(:operations) { [{ type: 'fix_grammar' }] }

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
    allow(assistant).to receive(:for_user).with(user, hash_including(:contextual_information)).and_return(chat)
    allow(AI::AssistantService).to receive(:new).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:ok).and_yield(valid_assistant_response).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:error).and_return(assistant_service)
    allow(assistant_service).to receive(:call)
  end

  describe '#call' do
    context 'when operations are valid' do
      context 'with single operation and valid response' do
        let(:valid_response) { valid_assistant_response[:message] }

        it 'returns success with result' do
          result = described_class.call!(user: user, text: text, operations: operations)
          expect(result).to eq(valid_response)
        end
      end

      context 'with multiple operations' do
        let(:operations) do
          [
            { type: 'fix_grammar' },
            { type: 'concise', options: { target_word_count: 10 } },
            { type: 'tone', options: { tone: 'formal' } }
          ]
        end

        it 'applies operations in canonical order' do
          expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
            expect(prompt).to match(/order="1".*fix_grammar/m)
            expect(prompt).to match(/order="2".*concise/m)
            expect(prompt).to match(/order="3".*tone/m)

            expect(prompt).to include('Rewrite in a formal tone')

            expect(prompt).to include('Target approximately 10 words')

            assistant_service
          end

          described_class.call!(user: user, text: text, operations: operations)
        end

        context 'when operations are provided out of order' do
          let(:operations) do
            [
              { type: 'tone', options: { tone: 'formal' } },
              { type: 'fix_grammar' },
              { type: 'translate', options: { language: 'French' } }
            ]
          end

          it 'reorders them according to OPERATION_ORDER' do
            expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
              expect(prompt).to match(/order="1".*fix_grammar/m)
              expect(prompt).to match(/order="2".*tone/m)
              expect(prompt).to match(/order="3".*translate/m)

              expect(prompt).to include('Rewrite in a formal tone')

              assistant_service
            end

            described_class.call!(user: user, text: text, operations: operations)
          end
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
          described_class.new(user: user, text: text, operations: operations).
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
          described_class.new(user: user, text: text, operations: operations).
            on(:error) { |msg| error = msg }.
            call

          expect(error).to eq('Failed to generate valid output after multiple attempts')
        end
      end

      context 'with translate operation' do
        let(:operations) { [{ type: 'translate', options: { language: 'Spanish' } }] }
        let(:valid_response) do
          {
            message: { 'result' => 'A él no le gustan las manzanas' },
            input_tokens: 100,
            output_tokens: 50
          }
        end

        before do
          allow(assistant_service).to receive(:on).with(:ok).and_yield(valid_response).and_return(assistant_service)
        end

        it 'includes language in prompt' do
          expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
            expect(prompt).to include('Spanish')
            expect(prompt).to include('Translate into Spanish')
            assistant_service
          end

          described_class.call!(user: user, text: text, operations: operations)
        end
      end

      context 'with concise operation and word count' do
        let(:operations) { [{ type: 'concise', options: { target_word_count: 50 } }] }

        it 'includes word count target in prompt' do
          expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
            expect(prompt).to include('Target approximately 50 words')
            assistant_service
          end

          described_class.call!(user: user, text: text, operations: operations)
        end
      end

      context 'with concise operation without word count' do
        let(:operations) { [{ type: 'concise' }] }

        it 'does not include word count in prompt' do
          expect(AI::AssistantService).to receive(:new) do |_assistant_id, _user, prompt, _options|
            expect(prompt).not_to include('Target approximately')
            expect(prompt).to include('Make the text more concise')
            assistant_service
          end

          described_class.call!(user: user, text: text, operations: operations)
        end
      end
    end

    context 'when operations are invalid' do
      let(:operations) { [{ type: 'invalid_operation' }] }

      it 'returns error' do
        error = nil
        described_class.new(user: user, text: text, operations: operations).
          on(:error) { |msg| error = msg }.
          call

        expect(error).to include('invalid_operation')
      end

      context 'with multiple invalid operations' do
        let(:operations) do
          [
            { type: 'fix_grammar' },
            { type: 'invalid_op1' },
            { type: 'invalid_op2' }
          ]
        end

        it 'returns error with all invalid operations' do
          error = nil
          described_class.new(user: user, text: text, operations: operations).
            on(:error) { |msg| error = msg }.
            call

          expect(error).to include('invalid_op1')
          expect(error).to include('invalid_op2')
        end
      end
    end

    context 'when assistant is not configured' do
      before do
        allow(AI::Assistant).to receive_message_chain(:writing_assistant, :last).and_return(nil)
      end

      it 'raises error' do
        error = nil
        described_class.new(user: user, text: text, operations: operations).
          on(:error) { |msg| error = msg }.
          call

        expect(error).to eq('Writing Assistant not configured')
      end
    end
  end
end
