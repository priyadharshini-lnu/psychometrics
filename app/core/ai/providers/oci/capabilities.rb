# frozen_string_literal: true

# The capabilities can only be used if models are refreshed using `RubyLLM::Models.refresh!`
# Without refreshing, the models will not have accurate capabilities information.
module AI
  module Providers
    class Oci
      module Capabilities
        module_function

        def models
          @models ||= [
            {
              id: 'cohere.command-a',
              name: 'Cohere: Command A',
              family: 'cohere.command-a',
              context_window: 256_000,
              max_output_tokens: 4000,
              modalities: {
                input: ['text'],
                output: ['text']
              },
              capabilities: %w[streaming structured_output function_calling],
              pricing: {
                text_tokens: {
                  standard: {
                    # Oracle has $0.0156 per 10,000 characters(transaction) includes output + input
                    input_per_million: 5.46,
                    output_per_million: 5.46,
                    cached_input_per_million: 0
                  }
                }
              },
              temperature_range: [0.0, 2.0],
              supports_vision: false,
              supports_functions: false,
              supports_json_mode: true,
              supports_streaming: true,
              description: 'Command A is an open-weights 111B parameter model with a 256k context window ' \
                           'focused on delivering great performance across agentic, multilingual, and coding use cases.'
            },
            {
              id: 'cohere.embed-v4.0',
              name: 'Cohere: Embed v4.0',
              family: 'cohere.embed-v4.0',
              context_window: 512,
              max_output_tokens: nil,
              modalities: {
                input: ['text'],
                output: ['embedding']
              },
              capabilities: ['embedding'],
              pricing: {
                text_tokens: {
                  standard: {
                    # $0.001 per 10,000 characters/transaction
                    input_per_million: 0.35,
                    output_per_million: 0,
                    cached_input_per_million: 0
                  }
                }
              },
              temperature_range: nil,
              supports_vision: false,
              supports_functions: false,
              supports_json_mode: false,
              supports_streaming: false,
              description: "Cohere's embedding model for semantic search and retrieval tasks."
            }
          ]
        end

        def find_model(model_id)
          models.find { |model| model[:id] == model_id }
        end

        def context_window_for(model_id)
          find_model(model_id)&.dig(:context_window) || 4096
        end

        def max_tokens_for(model_id)
          find_model(model_id)&.dig(:max_output_tokens) || 4000
        end

        def input_price_for(model_id)
          find_model(model_id)&.dig(:pricing, :text_tokens, :standard, :input_per_million) || 0
        end

        def output_price_for(model_id)
          find_model(model_id)&.dig(:pricing, :text_tokens, :standard, :output_per_million) || 0
        end

        def cache_hit_price_for(model_id)
          find_model(model_id)&.dig(:pricing, :text_tokens, :standard, :cached_input_per_million) || 0
        end

        def supports_vision?(model_id)
          find_model(model_id)&.dig(:supports_vision) || false
        end

        def supports_functions?(model_id)
          find_model(model_id)&.dig(:supports_functions) || false
        end

        def supports_json_mode?(model_id)
          find_model(model_id)&.dig(:supports_json_mode) || false
        end

        def supports_streaming?(model_id)
          find_model(model_id)&.dig(:supports_streaming) || false
        end

        def format_display_name(model_id)
          find_model(model_id)&.dig(:name) || model_id.humanize
        end

        def model_family(model_id)
          find_model(model_id)&.dig(:family) || 'unknown'
        end

        def normalize_temperature(temperature, model_id)
          return nil if temperature.nil?

          model = find_model(model_id)
          return temperature unless model&.dig(:temperature_range)

          min_temp, max_temp = model[:temperature_range]
          temperature.clamp(min_temp, max_temp)
        end

        def modalities_for(model_id)
          find_model(model_id)&.dig(:modalities) || { input: ['text'], output: ['text'] }
        end

        def capabilities_for(model_id)
          find_model(model_id)&.dig(:capabilities) || []
        end

        def pricing_for(model_id)
          find_model(model_id)&.dig(:pricing) || {
            text_tokens: {
              standard: {
                input_per_million: 1.0,
                output_per_million: 1.0,
                cached_input_per_million: 0
              }
            }
          }
        end

        def description_for(model_id)
          find_model(model_id)&.dig(:description) || ''
        end

        def default_input_price
          5.46
        end

        def default_output_price
          5.46
        end

        def default_cache_hit_price
          0
        end
      end
    end
  end
end
