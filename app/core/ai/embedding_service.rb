# frozen_string_literal: true

module AI
  class EmbeddingService < BaseCommand
    class Error < StandardError; end
    class UnsupportedServiceError < StandardError; end
    class ServiceNotConfiguredError < StandardError; end

    private_attr_reader :embedding_texts, :dimensions

    AVAILABLE_PROVIDERS = %w[azure_openai].freeze

    def initialize(embedding_texts, dimensions: ::VectorEmbedding::EMBEDDING_DIMENSIONS)
      @embedding_texts = embedding_texts
      @dimensions = dimensions
    end

    def call
      validate_service_configured!
      validate_provider_configurations!
      broadcast(:ok, generate_embedding_vectors)
    rescue RubyLLM::Error, UnsupportedServiceError => e
      broadcast(:error, e.message)
    rescue ServiceNotConfiguredError => e
      Rails.logger.warn(e.message)
    end

    private

    def generate_embedding_vectors
      embedding = RubyLLM.embed(embedding_texts, context: ruby_llm_context, dimensions: dimensions)
      embedding.vectors
    end

    def validate_provider_configurations!
      errors = []

      provider = embedding_config[:provider]
      unless AVAILABLE_PROVIDERS.include?(provider)
        errors << "Unsupported provider '#{provider}' (available: #{AVAILABLE_PROVIDERS.join(', ')})"
      end

      return if errors.empty?

      raise UnsupportedServiceError, "Embedding service configuration errors: #{errors.join(', ')}"
    end

    def validate_service_configured!
      required_configs = { api_key: 'API key', api_endpoint: 'API endpoint', model: 'Model' }

      errors = []
      required_configs.each do |key, description|
        value = embedding_config[key]
        if value.nil? || value.to_s.strip.empty?
          errors << "#{description} is missing"
        end
      end

      return if errors.empty?

      raise ServiceNotConfiguredError, "Embedding service not configured: #{errors.join(', ')}"
    end

    def embedding_config
      @embedding_config ||= Settings.ai_embedding_provider
    end

    def ruby_llm_context
      RubyLLM.context do |config|
        config.openai_api_key = embedding_config[:api_key]
        config.openai_api_base = embedding_config[:api_endpoint]
        config.default_embedding_model = embedding_config[:model]
      end
    end
  end
end
