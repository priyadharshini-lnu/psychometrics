# frozen_string_literal: true

module AI
  class EmbeddingService < BaseCommand
    class Error < StandardError; end
    class UnsupportedServiceError < StandardError; end
    class ServiceNotConfiguredError < StandardError; end

    private_attr_reader :embedding_texts, :dimensions

    AVAILABLE_PROVIDERS = %w[openai oci].freeze
    CUSTOM_PROVIDERS = %w[oci].freeze

    CONFIG_KEYS = {
      api_key: 'API key', api_endpoint: 'API endpoint', model: 'Model'
    }.freeze

    REQUIRED_CONFIG_BY_PROVIDER = {
      'openai' => %i[api_key api_endpoint model],
      'oci' => %i[model]
    }.freeze

    def initialize(embedding_texts, dimensions: ::VectorEmbedding::DEFAULT_EMBEDDING_DIMENSIONS)
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
      provider = embedding_config[:provider]
      embedding = RubyLLM.embed(
        embedding_texts,
        provider: provider,
        context: ruby_llm_context,
        dimensions: dimensions,
        assume_model_exists: CUSTOM_PROVIDERS.include?(provider)
      )
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
      required_configs = REQUIRED_CONFIG_BY_PROVIDER[embedding_config[:provider]] || []

      errors = []
      required_configs.each do |key|
        value = embedding_config[key]
        if value.nil? || value.to_s.strip.empty?
          errors << "#{CONFIG_KEYS[key]} is missing"
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
