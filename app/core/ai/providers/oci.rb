# frozen_string_literal: true

module AI
  module Providers
    # Oracle Cloud Infrastructure (OCI) Generative AI integration.
    class Oci < RubyLLM::Provider
      include AI::Providers::Oci::Chat
      include AI::Providers::Oci::Models
      include AI::Providers::Oci::Config

      # Used by Providers::Oci::Chat for calling the inference
      def api_base
        @config.oci_generative_ai_api_base || "https://inference.generativeai.#{oci_region}.oci.oraclecloud.com"
      end

      def headers
        # OCI uses a different authentication mechanism (request signing)
        # Headers are built dynamically in the chat methods
        {}
      end

      # Used by Providers::Oci::Chat for calling the inference
      def model_id
        @config.oci_model_id
      end

      def maybe_normalize_temperature(temperature, model_id)
        AI::Providers::Oci::Capabilities.normalize_temperature(temperature, model_id)
      end

      def models_url
        # OCI doesn't have a standard models list endpoint like OpenAI
        # Models are managed at the compartment level
        nil
      end

      delegate :list_models, to: :'::AI::Providers::Oci::Models'

      class << self
        def capabilities
          AI::Providers::Oci::Capabilities
        end

        def configuration_requirements
          %i[]
        end

        def local?
          false
        end

        def remote?
          true
        end
      end

      private

      def raise_config_error(config_name)
        raise Error, "OCI configuration missing: #{config_name}. Please set it in your configuration."
      end
    end
  end
end
