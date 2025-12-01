# frozen_string_literal: true

require 'rails_helper'

describe AI::AssistableService::Attachment do
  let!(:user) { create(:user) }
  let!(:ai_assistant) { create(:assistant, assistant_type: :content_writer) }
  let(:blob) do
    blob = ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new('Test PDF content'),
      filename: 'test_document.pdf',
      content_type: 'application/pdf'
    )
    # Mock the URL to be Oracle Object Storage compatible
    allow(blob).to receive(:url).and_return('https://test-namespace.compat.objectstorage.us-ashburn-1.oraclecloud.com/test-bucket/test_document.pdf')
    blob
  end
  let(:attachment) do
    ActiveStorage::Attachment.create!(
      name: 'user_document',
      record: user,
      blob: blob
    )
  end
  let(:instruction) { 'Analyze this document' }
  let(:options) { {} }
  let(:extracted_text) { 'This is the extracted text from OCR' }

  let(:ai_provider_config) do
    {
      'model_id' => 'gpt-4o-mini',
      'name' => 'OpenAI GPT-4o Mini',
      'model' => 'gpt-4o-mini',
      'context' => {
        'openai_api_key' => 'test-api-key'
      }
    }
  end

  let(:oci_provider_config) do
    {
      'model_id' => 'cohere.command-a',
      'name' => 'OCI Cohere Command A',
      'custom_provider' => 'oci',
      'model' => 'cohere.command-a',
      'modalities' => {
        'input' => ['text'],
        'output' => ['text']
      },
      'context' => {
        'oci_compartment_id' => 'test-compartment',
        'oci_model_id' => 'cohere.command-a'
      }
    }
  end

  before do
    allow(Settings).to receive(:ai_providers).and_return([ai_provider_config, oci_provider_config])
  end

  shared_context 'assistant service mocking' do
    let(:assistant_service_instance) { instance_double(AI::AssistantService) }

    before do
      allow(AI::AssistantService).to receive(:new).and_return(assistant_service_instance)
      allow(assistant_service_instance).to receive(:on).and_return(assistant_service_instance)
      allow(assistant_service_instance).to receive(:call)
    end
  end

  shared_context 'assistant chat setup' do
    let(:assistant_chat) { ai_assistant.for_user(user) }

    before do
      allow(ai_assistant).to receive(:for_user).and_return(assistant_chat)
      allow(assistant_chat).to receive(:with_assistant_context).and_return(assistant_chat)
    end
  end

  describe '#call' do
    context 'when assistant has vision model (OpenAI)' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat, user: user, document_attachment: attachment)
      end

      before do
        allow(ai_assistant).to receive(:ai_provider_for_model).and_return(ai_provider_config)
        allow(service).to receive(:session).and_return(session)
      end

      it 'does not include documents in request params' do
        expect(service.send(:request_params)).to eq({})
      end

      it 'includes attachment URL in ask params' do
        expected_params = { with: attachment.blob.url, service: :openai_response_api }
        expect(service.send(:ask_params)).to eq(expected_params)
      end

      it 'does not call OCR service' do
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'Analysis complete' })

        service.call

        expect(AI::Services::OciOcr).not_to receive(:new)
      end
    end

    context 'when assistant has text-only model (OCI Cohere)' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat, user: user, document_attachment: attachment)
      end

      before do
        allow(ai_assistant).to receive(:ai_provider_for_model).and_return(oci_provider_config)
        allow(service).to receive(:session).and_return(session)
      end

      it 'does not include attachment URL in ask params' do
        expect(service.send(:ask_params)).to eq({})
      end

      it 'calls OCR service when no extracted text in meta' do
        stub_wisper_publisher('AI::Services::OciOcr', :call, :ok, extracted_text)
        expect(AI::Services::OciOcr).to receive(:new).with(blob).and_call_original

        service.send(:extracted_information_as_context)
      end

      it 'adds file context as instructions for text-only models' do
        stub_wisper_publisher('AI::Services::OciOcr', :call, :ok, extracted_text)
        stub_wisper_publisher('AI::AssistantService', :call, :ok, { message: 'Analysis complete' })

        expected_context = <<~FILE
          <document filename="test_document.pdf" citation_required="false">
          #{extracted_text}
          </document>
        FILE

        expect(service).to receive(:add_instructions).with(expected_context)
        service.call
      end

      it 'saves OCR text to session meta after successful extraction' do
        stub_wisper_publisher('AI::Services::OciOcr', :call, :ok, extracted_text)

        expect(session).to receive(:update!).with(meta: { document: extracted_text })

        service.send(:extracted_information_as_context)
      end
    end

    context 'when session meta already has extracted text' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let(:cached_text) { 'This is cached OCR text' }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat,
               user: user,
               document_attachment: attachment,
               meta: { document: cached_text })
      end

      before do
        allow(ai_assistant).to receive(:ai_provider_for_model).and_return(oci_provider_config)
        allow(service).to receive(:session).and_return(session)
        session.reload
        allow(AI::Services::OciOcr).to receive(:new).and_return(double('ocr_service'))
      end

      it 'uses cached text instead of calling OCR service' do
        allow(service).to receive(:session_has_extracted_text?).and_return(true)
        allow(service).to receive(:session_meta_info).and_return({ document: cached_text })

        result = service.send(:extracted_information_as_context)

        expect(result).to eq(cached_text)
        expect(AI::Services::OciOcr).not_to have_received(:new)
      end

      it 'includes cached text in file context' do
        allow(service).to receive(:session_has_extracted_text?).and_return(true)
        allow(service).to receive(:session_meta_info).and_return({ document: cached_text })

        expected_context = <<~FILE
          <document filename="test_document.pdf" citation_required="false">
          #{cached_text}
          </document>
        FILE

        expect(service.send(:file_as_context)).to eq(expected_context)
      end
    end

    context 'when OCR service fails' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat, user: user, document_attachment: attachment)
      end
      let(:error_message) { 'OCR processing failed' }

      before do
        allow(ai_assistant).to receive(:ai_provider_for_model).and_return(oci_provider_config)
        allow(service).to receive(:session).and_return(session)
        stub_wisper_publisher('AI::Services::OciOcr', :call, :error, error_message)
      end

      it 'raises InformationExtractionError when OCR fails' do
        expect { service.send(:extracted_information_as_context) }.to raise_error(
          AI::AssistableService::Attachment::InformationExtractionError,
          error_message
        )
      end

      it 'handles InformationExtractionError and marks session as failed' do
        allow(service).to receive(:extracted_information_as_context).and_raise(
          AI::AssistableService::Attachment::InformationExtractionError.new(error_message)
        )
        allow(service).to receive(:handle_assistant_error_response).and_return(['Generic error', {}])

        expect(session).to receive(:mark_as_failed!).with('Generic error', meta: {})
        expect(service).to receive(:broadcast).with(:error, 'Generic error')

        service.call
      end
    end

    context 'when assistant service succeeds' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat, user: user, document_attachment: attachment)
      end
      let(:assistant_response) { { message: 'Document analysis complete' } }

      before do
        allow(service).to receive(:session).and_return(session)
        stub_wisper_publisher('AI::AssistantService', :call, :ok, assistant_response)
      end

      it 'marks session as completed with analysis' do
        expect(session).to receive(:mark_as_completed!).with('Document analysis complete')
        expect(service).to receive(:broadcast).with(:ok, 'Document analysis complete')

        service.call
      end
    end

    context 'when assistant service fails' do
      include_context 'assistant chat setup'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }
      let!(:session) do
        create(:assisted_user_document_summary, :with_chat, user: user, document_attachment: attachment)
      end
      let(:error_message) { 'AI service failed' }

      before do
        allow(service).to receive(:session).and_return(session)
        stub_wisper_publisher('AI::AssistantService', :call, :error, error_message, StandardError.new)
        allow(service).to receive(:handle_assistant_error_response).and_return(['Generic error',
                                                                                { error_type: 'service_error' }])
      end

      it 'marks session as failed and broadcasts error' do
        expect(session).to receive(:mark_as_failed!).with('Generic error', meta: { error_type: 'service_error' })
        expect(service).to receive(:broadcast).with(:error, 'Generic error')

        service.call
      end
    end

    context 'when verifying assistant context is passed' do
      include_context 'assistant service mocking'

      let(:service) { described_class.new(attachment, user, ai_assistant, instruction, options) }

      it 'passes locale option to UserData parser and has session context' do
        locale = 'fr'
        options = { locale: locale }
        service = described_class.new(attachment, user, ai_assistant, instruction, options)

        user_data_parser = instance_double(AI::Utils::DependencyParser::UserData)
        allow(user_data_parser).to receive(:parse).and_return('<user_data></user_data>')

        allow(AI::Utils::DependencyParser::UserData).to receive(:new) do |_user, args|
          expect(args[:locale]).to eq(locale)
          user_data_parser
        end

        service.call

        expect(AI::Utils::DependencyParser::UserData).to have_received(:new)
      end
    end
  end
end
