# frozen_string_literal: true

# Ref: https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai-inference/20231130/EmbedTextResult/EmbedText
module AI
  module Providers
    class Oci
      module Embeddings
        include Config
        include Errors

        def embed(text, model:, dimensions: 512, input_type: 'SEARCH_DOCUMENT') # rubocop:disable Lint/UnusedMethodArgument
          client = create_generative_ai_client

          response = client.embed_text(build_oci_embed_text_details(text, model, input_type))

          parse_embedding_response(response, model:, text:)
        rescue OCI::Errors::ServiceError => e
          # Raising RubyLLM::Error to be consistently handly different providers
          handle_oci_service_error(e)
        end

        def parse_embedding_response(response, model:, text:)
          data = response.data
          input_tokens = data.usage.prompt_tokens || 0
          vectors = data.embeddings

          vectors = vectors.first if vectors.length == 1 && !text.is_a?(Array)

          RubyLLM::Embedding.new(vectors:, model:, input_tokens:)
        end

        private

        def build_oci_embed_text_details(text, model, input_type)
          OCI::GenerativeAiInference::Models::EmbedTextDetails.new(
            inputs: Array.wrap(text),
            serving_mode:
              OCI::GenerativeAiInference::Models::OnDemandServingMode.new(
                servingType: 'ON_DEMAND', # camel case probably bug in OCI
                model_id: model
              ),
            compartment_id: oci_compartment_id,
            is_echo: true,
            truncate: 'NONE',
            input_type: input_type
          )
        end

        def create_generative_ai_client
          config = build_oci_config

          OCI::GenerativeAiInference::GenerativeAiInferenceClient.new(
            config: config,
            endpoint: api_base
          )
        end
      end
    end
  end
end
