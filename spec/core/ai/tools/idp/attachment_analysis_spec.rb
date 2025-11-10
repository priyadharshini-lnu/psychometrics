# frozen_string_literal: true

require 'rails_helper'

describe AI::Tools::Idp::AttachmentAnalysis do
  subject { described_class.new(user_idp_plan, current_user, ai_assistant) }

  let(:current_user) { create(:user) }
  let(:user_idp_plan) { create(:user_idp_plan, user: current_user) }
  let(:ai_assistant) { create(:assistant) }
  let(:document_blob) do
    ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new('Test PDF content'),
      filename: 'test_document.pdf',
      content_type: 'application/pdf'
    )
  end
  let(:document_attachment) { user_idp_plan.user_document.attachment }
  let(:ai_assistant_chat) { create(:assistant_chat, ai_assistant: ai_assistant, user: current_user) }
  let(:assistant_service) { instance_double(AI::AssistantService) }

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4o-mini',
      'name' => 'OpenAI GPT-4o Mini',
      'context' => {
        'openai_api_key' => 'test-api-key'
      }
    }
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config])
    user_idp_plan.user_document.attach(document_blob)

    allow(AI::AssistantService).to receive(:new).and_return(assistant_service)

    allow(ai_assistant).to receive(:user_prompt).and_return('Default analysis prompt')
    allow(ai_assistant).to receive(:for_user).and_return(ai_assistant_chat)
  end

  describe '#execute' do
    context 'when no document is attached' do
      before do
        allow(user_idp_plan).to receive_message_chain(:user_document, :attached?).and_return(false)
      end

      it 'returns error for missing document' do
        result = subject.execute(context: nil)

        expect(result).to eq({ error: 'No document attached to the IDP plan' })
      end
    end

    context 'when document summary already exists' do
      let(:ai_assisted_doc_summary_session) do
        create(:assisted_user_document_summary, :completed,
               user: current_user,
               document_attachment: document_attachment)
      end

      before do
        ai_assistant_chat.update!(ai_assisted_user_session: ai_assisted_doc_summary_session)
        # Mock the attachment to return the summary
        allow_any_instance_of(ActiveStorage::Attachment).to receive(:ai_assisted_user_document_summary).
          and_return(ai_assisted_doc_summary_session)
      end

      it 'returns the existing summary without calling the assistant service' do
        result = subject.execute(context: 'Document is a resume')

        expect(result).to eq(ai_assisted_doc_summary_session.summary)
        expect(AI::AssistantService).not_to have_received(:new)
      end
    end

    context 'creates a new session' do
      it 'when none exists' do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'AI analysis complete' })

        expect do
          subject.execute(context: 'Document is a resume')
        end.to change(AI::AssistedUserDocumentSummary, :count).by(1)

        summary_session = user_idp_plan.reload.user_document.reload.ai_assisted_user_document_summary

        expect(summary_session).not_to be_nil
        expect(summary_session.summary).to eq('AI analysis complete')
      end
    end

    context 'when document exists but no summary exists' do
      let(:ai_assisted_doc_summary_session) do
        create(:assisted_user_document_summary,
               user: current_user,
               document_attachment: document_attachment)
      end

      before do
        ai_assistant_chat.update!(ai_assisted_user_session: ai_assisted_doc_summary_session)
        allow(document_blob).to receive(:url).and_return('https://example.com/document.pdf')
      end

      context 'when calling assistant service' do
        before do
          allow_any_instance_of(ActiveStorage::Attachment).to receive(:ai_assisted_user_document_summary).
            and_return(ai_assisted_doc_summary_session)
        end

        it 'processes document analysis with provided context and returns response' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok,
                                { message: 'Document analysis with context complete' })

          result = subject.execute(context: 'Document is a resume')

          expect(ai_assisted_doc_summary_session.reload.status).to eq('completed')
          expect(ai_assisted_doc_summary_session.reload.summary).to eq('Document analysis with context complete')
          expect(result).to eq('Document analysis with context complete')
        end

        it 'processes document analysis with default prompt when context is nil' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok,
                                { message: 'Document analysis with default prompt complete' })

          result = subject.execute(context: nil)

          expect(ai_assisted_doc_summary_session.reload.status).to eq('completed')
          expect(ai_assisted_doc_summary_session.reload.summary).to eq('Document analysis with default prompt complete')
          expect(result).to eq('Document analysis with default prompt complete')
        end

        it 'passes correct chat and chat_params to AssistantService' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'AI analysis complete' })
          allow(AI::AssistantService).to receive(:new).and_call_original

          subject.execute(context: 'Document is a resume')

          expect(AI::AssistantService).to have_received(:new).with(
            ai_assistant.id,
            current_user,
            'Document is a resume',
            chat: ai_assistant_chat.with_assistant_context,
            chat_params: { with: 'https://example.com/document.pdf', service: :openai_response_api },
            ignore_user_prompt: nil
          )
        end
      end

      context 'when assistant service succeeds' do
        let(:assistant_response) { { message: 'Document analysis completed successfully' } }

        before do
          allow_any_instance_of(ActiveStorage::Attachment).to receive(:ai_assisted_user_document_summary).
            and_return(ai_assisted_doc_summary_session)
        end

        it 'marks session as completed with the response message' do
          stub_wisper_publisher('AI::AssistantService', :call, :ok, assistant_response)

          result = subject.execute(context: 'Document is a resume')

          expect(ai_assisted_doc_summary_session.reload.status).to eq('completed')
          expect(ai_assisted_doc_summary_session.reload.summary).to eq('Document analysis completed successfully')
          expect(result).to eq('Document analysis completed successfully')
        end
      end

      context 'when assistant service fails' do
        let(:error_message) { 'AI service failed to analyze document' }

        before do
          allow_any_instance_of(ActiveStorage::Attachment).to receive(:ai_assisted_user_document_summary).
            and_return(ai_assisted_doc_summary_session)
        end

        it 'marks session as failed and returns error' do
          stub_wisper_publisher('AI::AssistantService', :call, :error, error_message)

          result = subject.execute(context: 'Document is a resume')

          expected_error = 'Something went wrong while processing your request. Please contact your administrator.'
          expect(ai_assisted_doc_summary_session.reload.status).to eq('failed')
          expect(ai_assisted_doc_summary_session.reload.error).to eq(expected_error)
          expect(result).to eq({ error: expected_error })
        end
      end
    end

    context 'when IdpDocumentNotFoundError is raised during execution' do
      before do
        allow(subject).to receive(:validate_user_idp_document_exists!).and_raise(
          AI::Tools::Idp::AttachmentAnalysis::IdpDocumentNotFoundError, 'Document not found'
        )
      end

      it 'returns error hash' do
        result = subject.execute(context: 'Document is a resume')

        expect(result).to eq({ error: 'Document not found' })
      end
    end
  end
end
