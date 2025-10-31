# frozen_string_literal: true

module AI
  module Providers
    class Oci
      module Tools
        def format_tools(tools)
          return [] if tools.empty?

          tools.values.map { |tool| function_declaration_for(tool) }
        end

        def extract_tool_calls(chat_response)
          tool_calls = extract_tool_calls_from_response(chat_response)
          return nil if tool_calls.blank?

          result = {}
          tool_calls.each_with_index do |tool_call, index|
            id = generate_tool_call_id(tool_call, index)
            result[id] = RubyLLM::ToolCall.new(
              id: id,
              name: tool_call.name,
              arguments: normalize_arguments(tool_call.parameters)
            )
          end

          result
        end

        private

        def function_declaration_for(tool)
          {
            name: tool.name,
            description: tool.description,
            parameters: format_parameters_for_cohere(tool.parameters)
          }
        end

        def format_parameters_for_cohere(parameters)
          return {} if parameters.blank?

          parameters.transform_values do |param|
            {
              description: param.description,
              type: param_type_for_cohere(param.type),
              required: param.required || false
            }
          end
        end

        def param_type_for_cohere(type)
          {
            'integer' => 'int',
            'number' => 'float',
            'float' => 'float',
            'boolean' => 'bool',
            'array' => 'list',
            'object' => 'object'
          }.fetch(type.to_s.downcase, 'str')
        end

        def extract_tool_calls_from_response(chat_response)
          return nil unless chat_response

          if chat_response.respond_to?(:tool_calls) && chat_response.tool_calls
            chat_response.tool_calls
          elsif chat_response.respond_to?(:chat_response) &&
                chat_response.chat_response.respond_to?(:tool_calls)
            chat_response.chat_response.tool_calls
          end
        end

        def generate_tool_call_id(tool_call, index)
          if tool_call.respond_to?(:id) && tool_call.id
            tool_call.id
          else
            "#{tool_call.name}_#{index}_#{SecureRandom.hex(4)}"
          end
        end

        def normalize_arguments(arguments)
          case arguments
            when String then parse_json_safely(arguments)
            when Hash then arguments
            when nil then {}
            else
              arguments.respond_to?(:to_h) ? arguments.to_h : {}
          end
        end

        def parse_json_safely(json_string)
          JSON.parse(json_string)
        rescue JSON::ParserError => e
          RubyLLM.logger.warn "Failed to parse tool arguments as JSON: #{e.message}"
          {}
        end
      end
    end
  end
end
