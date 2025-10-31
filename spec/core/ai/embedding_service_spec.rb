# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::EmbeddingService do
  let(:embedding_texts) { ['Hello world', 'How are you?'] }
  let(:dimensions) { 512 }
  let(:mock_vectors) { [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]] }

  describe '.call' do
    context 'when service is properly configured' do
      before do
        allow(Settings).to receive(:ai_embedding_provider).and_return({
          provider: 'azure_openai',
          api_key: 'test-key',
          api_endpoint: 'https://test-endpoint.openai.azure.com',
          model: 'text-embedding-3-large'
        })
      end

      context 'when embedding generation succeeds' do
        let(:mock_embedding) { double('embedding', vectors: mock_vectors) }

        before do
          allow(RubyLLM).to receive(:embed).and_return(mock_embedding)
        end

        it 'broadcasts :ok with embedding vectors' do
          result = described_class.call(embedding_texts, dimensions: dimensions)

          expect(result[:ok]).to eq(mock_vectors)
          expect(result[:error]).to be_nil
        end

        it 'calls RubyLLM.embed with correct parameters' do
          described_class.call(embedding_texts, dimensions: dimensions)

          expect(RubyLLM).to have_received(:embed).with(
            embedding_texts,
            context: anything,
            dimensions: dimensions
          )
        end

        it 'uses default dimensions when not specified' do
          stub_const('VectorEmbedding::EMBEDDING_DIMENSIONS', 1536)
          described_class.call(embedding_texts)

          expect(RubyLLM).to have_received(:embed).with(
            embedding_texts,
            context: anything,
            dimensions: 1536
          )
        end
      end

      context 'when RubyLLM raises an error' do
        before do
          allow(RubyLLM).to receive(:embed).and_raise(RubyLLM::Error.new)
        end

        it 'broadcasts :error with the error message' do
          result = described_class.call(embedding_texts)

          expect(result[:error]).to include('RubyLLM::Error')
          expect(result[:ok]).to be_nil
        end
      end
    end

    context 'when provider is not supported' do
      before do
        allow(Settings).to receive(:ai_embedding_provider).and_return({
          provider: 'unsupported_provider',
          api_key: 'test-key',
          api_endpoint: 'https://test-endpoint.com',
          model: 'test-model'
        })
      end

      it 'broadcasts :error with unsupported provider message' do
        result = described_class.call(embedding_texts)

        expect(result[:error]).to include("Unsupported provider 'unsupported_provider'")
        expect(result[:ok]).to be_nil
      end
    end

    context 'when service is not configured' do
      context 'when api_key is missing' do
        before do
          allow(Settings).to receive(:ai_embedding_provider).and_return({
            provider: 'azure_openai',
            api_key: nil,
            api_endpoint: 'https://test-endpoint.com',
            model: 'test-model'
          })
        end

        it 'does not broadcast anything and logs warning' do
          expect(Rails.logger).to receive(:warn).with(/API key is missing/)

          result = described_class.call(embedding_texts)

          expect(result[:error]).to be_nil
          expect(result[:ok]).to be_nil
        end
      end

      context 'when api_endpoint is missing' do
        before do
          allow(Settings).to receive(:ai_embedding_provider).and_return({
            provider: 'azure_openai',
            api_key: 'test-key',
            api_endpoint: '',
            model: 'test-model'
          })
        end

        it 'does not broadcast anything and logs error' do
          expect(Rails.logger).to receive(:warn).with(/API endpoint is missing/)

          result = described_class.call(embedding_texts)

          expect(result[:error]).to be_nil
          expect(result[:ok]).to be_nil
        end
      end

      context 'when model is missing' do
        before do
          allow(Settings).to receive(:ai_embedding_provider).and_return({
            provider: 'azure_openai',
            api_key: 'test-key',
            api_endpoint: 'https://test-endpoint.com',
            model: nil
          })
        end

        it 'does not broadcast anything and logs error' do
          expect(Rails.logger).to receive(:warn).with(/Model is missing/)

          result = described_class.call(embedding_texts)

          expect(result[:error]).to be_nil
          expect(result[:ok]).to be_nil
        end
      end
    end
  end

  describe '.call!' do
    context 'when service succeeds' do
      before do
        allow(Settings).to receive(:ai_embedding_provider).and_return({
          provider: 'azure_openai',
          api_key: 'test-key',
          api_endpoint: 'https://test-endpoint.com',
          model: 'test-model'
        })

        mock_embedding = double('embedding', vectors: mock_vectors)
        allow(RubyLLM).to receive(:embed).and_return(mock_embedding)
      end

      it 'returns the embedding vectors directly' do
        result = described_class.call!(embedding_texts)
        expect(result).to eq(mock_vectors)
      end
    end
  end
end
