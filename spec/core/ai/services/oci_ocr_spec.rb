# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::Services::OciOcr, type: :service do
  let(:blob) { double('Blob', url: pdf_url) }
  let(:pdf_url) { 'https://example.com/test.pdf' }
  let(:compartment_id) { 'ocid1.compartment.oc1..test' }

  let(:mock_response) do
    double('Response', data: double('Data',
                                    pages: [
                                      double('Page', lines: [
                                        double('Line', text: 'Sample text from OCR'),
                                        double('Line', text: 'Another line of text')
                                      ])
                                    ],
                                    detected_languages: [
                                      double('DetectedLanguage', language: 'ENG', confidence: 0.95)
                                    ]))
  end

  let(:mock_config) { instance_double('OCI::Config') }
  let(:mock_client) { instance_double('OCI::AiDocument::AIServiceDocumentClient') }
  let(:mock_text_extraction_feature) { instance_double('OCI::AiDocument::Models::DocumentTextExtractionFeature') }
  let(:mock_language_classification_feature) { instance_double('OCI::AiDocument::Models::DocumentLanguageClassificationFeature') }
  let(:mock_analyze_document_details) { instance_double('OCI::AiDocument::Models::AnalyzeDocumentDetails') }
  let(:mock_inline_document_details) { instance_double('OCI::AiDocument::Models::InlineDocumentDetails') }
  let(:mock_object_storage_document_details) { instance_double('OCI::AiDocument::Models::ObjectStorageDocumentDetails') }

  before do
    allow(Settings).to receive_message_chain(:secrets, :oci, :user).and_return('test-user')
    allow(Settings).to receive_message_chain(:secrets, :oci, :fingerprint).and_return('test-fingerprint')
    allow(Settings).to receive_message_chain(:secrets, :oci, :tenancy).and_return('test-tenancy')
    allow(Settings).to receive_message_chain(:secrets, :oci, :private_key).and_return('test-key')
    allow(Settings).to receive_message_chain(:secrets, :oci, :region).and_return('us-phoenix-1')
    allow(Settings).to receive_message_chain(:secrets, :oci, :compartment_id).and_return(compartment_id)

    # Mock OCI Config
    allow(OCI::Config).to receive(:new).and_return(mock_config)
    allow(mock_config).to receive(:user=)
    allow(mock_config).to receive(:fingerprint=)
    allow(mock_config).to receive(:tenancy=)
    allow(mock_config).to receive(:key_content=)
    allow(mock_config).to receive(:region=)
    allow(mock_config).to receive(:validate)

    # Mock OCI Client
    allow(OCI::AiDocument::AIServiceDocumentClient).to receive(:new).with(config: mock_config).and_return(mock_client)
    allow(mock_client).to receive(:analyze_document).and_return(mock_response)

    # Mock OCI Model classes
    allow(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).
      and_return(mock_text_extraction_feature)
    allow(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).to receive(:new).
      and_return(mock_language_classification_feature)
    allow(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).
      and_return(mock_analyze_document_details)
    allow(OCI::AiDocument::Models::InlineDocumentDetails).to receive(:new).
      and_return(mock_inline_document_details)
    allow(OCI::AiDocument::Models::ObjectStorageDocumentDetails).to receive(:new).
      and_return(mock_object_storage_document_details)

    # Mock AnalyzeDocumentDetails setters
    allow(mock_analyze_document_details).to receive(:language=)
  end

  describe '#call' do
    context 'when language is provided' do
      let(:service) { described_class.new(blob, language: 'en') }

      it 'uses the specified language in the OCR request and does not add language classification feature' do
        expect(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).with(
          generate_searchable_pdf: false
        ).and_return(mock_text_extraction_feature)

        expect(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).
          not_to receive(:new)

        expect(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).with(
          features: [mock_text_extraction_feature],
          document: mock_inline_document_details,
          compartment_id: compartment_id
        ).and_return(mock_analyze_document_details)

        # Expect language to be set to 'ENG' (mapped from 'en')
        expect(mock_analyze_document_details).to receive(:language=).with('ENG')

        stub_request(:get, pdf_url).to_return(status: 200, body: 'test content')

        expect { service.call }.to broadcast(:ok, "Sample text from OCR\nAnother line of text")
      end
    end

    context 'when language is not provided' do
      let(:service) { described_class.new(blob) }

      it 'adds language classification feature and does not set language' do
        expect(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).with(
          generate_searchable_pdf: false
        ).and_return(mock_text_extraction_feature)

        expect(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).to receive(:new).
          and_return(mock_language_classification_feature)

        # Expect AnalyzeDocumentDetails to be created with both features
        expect(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).with(
          features: [mock_text_extraction_feature, mock_language_classification_feature],
          document: mock_inline_document_details,
          compartment_id: compartment_id
        ).and_return(mock_analyze_document_details)

        expect(mock_analyze_document_details).not_to receive(:language=)

        stub_request(:get, pdf_url).to_return(status: 200, body: 'test content')

        expect { service.call }.to broadcast(:ok, "Sample text from OCR\nAnother line of text")
      end
    end

    context 'when URL is not OCI Object Storage' do
      let(:pdf_url) { 'https://s3.amazonaws.com/bucket/test.pdf' }
      let(:service) { described_class.new(blob) }
      let(:document_content) { 'fake pdf content' }
      let(:encoded_content) { Base64.strict_encode64(document_content) }

      before do
        stub_request(:get, pdf_url).to_return(status: 200, body: document_content, headers: {})
      end

      it 'downloads the document and passes it as inline document details' do
        expect(OCI::AiDocument::Models::InlineDocumentDetails).to receive(:new).with(
          data: encoded_content
        ).and_return(mock_inline_document_details)

        expect(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).
          and_return(mock_text_extraction_feature)
        expect(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).to receive(:new).
          and_return(mock_language_classification_feature)
        expect(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).
          and_return(mock_analyze_document_details)

        expect { service.call }.to broadcast(:ok, "Sample text from OCR\nAnother line of text")
      end

      it 'broadcasts error when document download fails' do
        stub_request(:get, pdf_url).to_return(status: 404, body: 'Not Found')

        expect { service.call }.to raise_error(AI::Services::OciOcr::DocumentDownloadError)
      end

      it 'broadcasts error when document exceeds size limit' do
        large_content = 'x' * (9 * 1024 * 1024) # 9MB
        stub_request(:get, pdf_url).to_return(status: 200, body: large_content)

        expect do
          service.call
        end.to broadcast(:error, a_string_including('Document size', 'exceeds maximum allowed size'))
      end
    end

    context 'when URL is OCI Object Storage' do
      let(:pdf_url) { 'https://test-namespace.compat.objectstorage.us-phoenix-1.oraclecloud.com/test-bucket/test-file.pdf' }
      let(:service) { described_class.new(blob) }

      it 'parses the URL and passes object storage details without downloading' do
        expect(OCI::AiDocument::Models::ObjectStorageDocumentDetails).to receive(:new).with(
          namespace_name: 'test-namespace',
          bucket_name: 'test-bucket',
          object_name: 'test-file.pdf'
        ).and_return(mock_object_storage_document_details)

        # Setup the basic features and analyze document details
        expect(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).
          and_return(mock_text_extraction_feature)
        expect(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).to receive(:new).
          and_return(mock_language_classification_feature)
        expect(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).with(
          features: [mock_text_extraction_feature, mock_language_classification_feature],
          document: mock_object_storage_document_details,
          compartment_id: compartment_id
        ).and_return(mock_analyze_document_details)

        # Ensure no HTTP request is made to download the document
        expect(Net::HTTP).not_to receive(:new)

        expect { service.call }.to broadcast(:ok, "Sample text from OCR\nAnother line of text")
      end

      context 'with URL-encoded object names' do
        let(:pdf_url) { 'https://test-namespace.compat.objectstorage.us-phoenix-1.oraclecloud.com/test-bucket/folder%2Ftest%20file.pdf' }

        it 'properly decodes the object name' do
          expect(OCI::AiDocument::Models::ObjectStorageDocumentDetails).to receive(:new).with(
            namespace_name: 'test-namespace',
            bucket_name: 'test-bucket',
            object_name: 'folder/test file.pdf'
          ).and_return(mock_object_storage_document_details)

          # Setup other required mocks
          expect(OCI::AiDocument::Models::DocumentTextExtractionFeature).to receive(:new).
            and_return(mock_text_extraction_feature)
          expect(OCI::AiDocument::Models::DocumentLanguageClassificationFeature).to receive(:new).
            and_return(mock_language_classification_feature)
          expect(OCI::AiDocument::Models::AnalyzeDocumentDetails).to receive(:new).
            and_return(mock_analyze_document_details)

          expect { service.call }.to broadcast(:ok, "Sample text from OCR\nAnother line of text")
        end
      end
    end
  end
end
