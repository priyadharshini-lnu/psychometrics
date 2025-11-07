# frozen_string_literal: true

# Models available through OCI Generative AI service
module AI
  module Providers
    class Oci
      module Models
        module_function

        def list_models
          [
            create_model_info('cohere.command-a', 'Cohere: Command A'),
            create_model_info('cohere.embed-v4.0', 'Cohere: Embed v4.0')
          ]
        end

        def parse_list_models_response(_response, _provider_slug, _capabilities)
          list_models
        end

        def models_url
          # OCI doesn't have a standard models endpoint like OpenAI
          # Models are typically configured at the compartment/region level
          nil
        end

        def create_model_info(id, name)
          RubyLLM::Model::Info.new(
            id: id,
            name: name,
            provider: 'oci',
            family: AI::Providers::Oci::Capabilities.model_family(id),
            modalities: AI::Providers::Oci::Capabilities.modalities_for(id),
            capabilities: AI::Providers::Oci::Capabilities.capabilities_for(id),
            context_window: AI::Providers::Oci::Capabilities.context_window_for(id),
            max_output_tokens: AI::Providers::Oci::Capabilities.max_tokens_for(id),
            pricing: AI::Providers::Oci::Capabilities.pricing_for(id)
          )
        end
      end
    end
  end
end
