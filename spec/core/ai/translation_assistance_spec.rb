# frozen_string_literal: true

require 'rails_helper'

describe AI::TranslationAssistance do
  let(:user) { create(:user) }
  let(:assistant) { create(:assistant, :translation_assistant) }
  let(:chat) { instance_double(AI::AssistantChat) }
  let(:text) { 'He dont like apples' }
  let(:operation) { 'fix_grammar' }

  let(:assistant_service) { instance_double(AI::AssistantService) }

  let(:valid_assistant_response) do
    {
      message: {
        'translated_texts' => ['Hello'],
        'detected_language' => ['Arabic']
      },
      input_tokens: 100,
      output_tokens: 50
    }
  end

  before do
    allow(AI::Assistant).to receive_message_chain(:translation_assistant, :last).and_return(assistant)
    allow(assistant).to receive(:for_user).with(user).and_return(chat)
    allow(AI::AssistantService).to receive(:new).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:ok).and_yield(valid_assistant_response).and_return(assistant_service)
    allow(assistant_service).to receive(:on).with(:error).and_return(assistant_service)
    allow(assistant_service).to receive(:call)
  end

  describe '#call' do
    subject(:service) { described_class.new(user: user, texts: [text], options: options) }

    let(:options) { {} }

    context 'when translation is successful' do
      it 'broadcasts :ok with the translated result' do
        expect { service.call }.to broadcast(:ok, valid_assistant_response[:message])
      end

      it 'creates AssistantService with correct parameters' do
        service.call

        expect(AI::AssistantService).to have_received(:new).with(
          assistant.id,
          user,
          an_instance_of(String),
          chat: chat,
          validate_response_structure: true
        )
      end
    end

    context 'when translation fails with invalid response' do
      let(:invalid_response) do
        I18n.t('admin.assistant_toolbar_failed')
      end

      before do
        allow(assistant_service).to receive(:on).with(:error).and_yield(invalid_response).and_return(assistant_service)
      end

      it 'retries up to MAX_RETRIES times' do
        expect { service.call }.to broadcast(:error, I18n.t('admin.assistant_toolbar_failed'))
      end
    end

    context 'when AssistantService returns error' do
      let(:error_message) { 'Service error' }

      before do
        allow(assistant_service).to receive(:on).with(:error).and_yield(error_message).and_return(assistant_service)
        allow(assistant_service).to receive(:on).with(:ok).and_return(assistant_service)
      end

      it 'broadcasts the error message' do
        expect { service.call }.to broadcast(:error, error_message)
      end
    end

    context 'when an exception is raised' do
      before do
        allow(assistant_service).to receive(:call).and_raise(StandardError, 'Unexpected error')
      end

      it 'broadcasts the error message' do
        expect { service.call }.to broadcast(:error, 'Unexpected error')
      end
    end

    context 'with custom language option' do
      let(:options) { { language: 'Spanish' } }

      it 'includes the custom language in the prompt' do
        service.call

        expect(AI::AssistantService).to have_received(:new).with(
          assistant.id,
          user,
          include('Spanish'),
          chat: chat,
          validate_response_structure: true
        )
      end
    end

    context 'when translation assistant is not configured' do
      before do
        allow(AI::Assistant).to receive_message_chain(:translation_assistant, :last).and_return(nil)
      end

      it 'raises an error with appropriate message' do
        expect { service.call }.to broadcast(:error, I18n.t('admin.translation_assistant_not_configured'))
      end
    end
  end

  describe 'private methods' do
    subject(:service) { described_class.new(user: user, texts: [text], options: options) }

    let(:options) { {} }

    describe '#build_instruction' do
      context 'with default language' do
        it 'builds instruction with English as default' do
          instruction = service.send(:build_instruction)
          expect(instruction).to eq('Target language: English')
        end
      end

      context 'with custom language' do
        let(:options) { { language: 'French' } }

        it 'builds instruction with specified language' do
          instruction = service.send(:build_instruction)
          expect(instruction).to eq('Target language: French')
        end
      end
    end
  end
end
