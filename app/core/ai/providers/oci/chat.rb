# frozen_string_literal: true

# Ref: https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai-inference/20231130/datatypes/CohereChatRequest

# rubocop:disable Metrics/ModuleLength
module AI
  module Providers
    class Oci
      module Chat
        include Config
        include Tools
        include Errors

        DEFAULT_MAX_TOKENS = 600
        CITATION_QUALITY = 'FAST'
        SERVING_TYPE = 'ON_DEMAND'
        DEFAULT_SAFETY_MODE = 'STRICT'

        # rubocop:disable Metrics/ParameterLists, Lint/UnusedMethodArgument
        def render_payload(messages, tools:, temperature:, model: nil, stream: false, schema: nil,
                           thinking: nil, tool_prefs: nil)
          formatted_messages = format_messages(messages)
          formatted_tools = format_tools(tools)

          {
            compartmentId: oci_compartment_id,
            servingMode: {
              modelId: model_id,
              servingType: SERVING_TYPE
            },
            chatRequest: build_chat_request(formatted_messages, temperature, formatted_tools, stream, schema)
          }
        end
        # rubocop:enable Metrics/ParameterLists, Lint/UnusedMethodArgument

        def sync_response(_connection, payload, headers)
          client = create_generative_ai_client

          chat_details = build_oci_chat_details(payload, headers)

          RubyLLM.logger.debug "OCI Chat Request: #{chat_details.to_hash}"

          response = client.chat(chat_details)

          RubyLLM.logger.debug "OCI Chat Response: #{JSON.pretty_generate(response.data.to_hash)}"

          parse_completion_response(response)
        rescue OCI::Errors::ServiceError => e
          # Raising RubyLLM::Error to be consistently handly different providers
          handle_oci_service_error(e)
        end

        def parse_completion_response(response)
          chat_response = response.data.chat_response

          RubyLLM::Message.new(
            role: :assistant,
            content: chat_response.text,
            model_id: model_id,
            input_tokens: extract_input_tokens(chat_response),
            output_tokens: extract_output_tokens(chat_response),
            tool_calls: extract_tool_calls(chat_response)
          )
        end

        module_function

        def format_messages(messages)
          messages.filter_map do |msg|
            case msg.role
              when :system
                { role: 'SYSTEM', message: extract_text_content(msg.content) }
              when :user
                { role: 'USER', message: extract_text_content(msg.content) }
              when :assistant
                data = { role: 'CHATBOT', message: extract_text_content(msg.content) }
                data[:tool_calls] = msg.tool_calls if msg.tool_call?
                data
              when :tool
                parent_tool_call = parent_tool_call_from_message(msg.tool_call_id, messages)
                # Tool results will be handled separately by OCI API
                {
                  role: 'TOOL',
                  message: extract_text_content(msg.content),
                  tool_call_id: msg.tool_call_id,
                  tool_call_name: parent_tool_call&.name,
                  tool_call_parameters: parent_tool_call&.arguments
                }
            end
          end
        end

        def extract_text_content(content)
          if content.is_a?(RubyLLM::Content::Raw)
            value = content.value
            value.is_a?(Hash) || value.is_a?(Array) ? JSON.generate(value) : value.to_s
          elsif content.is_a?(RubyLLM::Content)
            content.text.to_s
          else
            content.to_s
          end
        end

        private

        def parent_tool_call_from_message(tool_call_id, messages)
          assistant_message = messages.find do |msg|
            msg.tool_call? && msg.tool_calls.key?(tool_call_id)
          end
          assistant_message.tool_calls[tool_call_id]
        end

        def create_generative_ai_client
          config = build_oci_config

          OCI::GenerativeAiInference::GenerativeAiInferenceClient.new(
            config: config,
            endpoint: api_base
          )
        end

        def build_oci_chat_details(payload, headers)
          serving_mode = OCI::GenerativeAiInference::Models::OnDemandServingMode.new(
            model_id: payload[:servingMode][:modelId]
          )

          # Extract params from payload (everything except the core structure)
          core_keys = %i[compartmentId servingMode chatRequest]
          params = payload.except(*core_keys)

          chat_request = build_cohere_chat_request(payload[:chatRequest], params, headers)

          OCI::GenerativeAiInference::Models::ChatDetails.new(
            serving_mode: serving_mode,
            compartment_id: payload[:compartmentId],
            chat_request: chat_request
          )
        end

        def build_cohere_chat_request(chat_request_data, params, _headers)
          request_params = build_chat_params(chat_request_data[:messages])

          apply_default_parameters!(request_params)
          request_params.merge!(params)

          add_tools_if_present!(request_params, chat_request_data[:tools])
          handle_schema_if_present!(request_params, chat_request_data, params)

          OCI::GenerativeAiInference::Models::CohereChatRequest.new(request_params)
        end

        def apply_default_parameters!(request_params)
          # Add default parameters
          request_params[:citation_quality] ||= CITATION_QUALITY

          # By default OCI doesn't have any specified limit mentioned that is internally used by the model
          # Through testing, we can see the limit is too low, setting it to 600 by default
          request_params[:max_tokens] ||= DEFAULT_MAX_TOKENS

          # Set default safety mode as STRICT, safer for professional environment,
          # OCI by default sets this value to CONTEXTUAL
          # CONTEXTUAL may allow some unsafe content based on the context of the conversation
          request_params[:safety_mode] ||= DEFAULT_SAFETY_MODE
        end

        def add_tools_if_present!(request_params, tools)
          return if tools.blank?

          request_params[:tools] = format_cohere_tools(tools)
        end

        def handle_schema_if_present!(request_params, chat_request_data, params)
          return if chat_request_data[:schema].blank?

          has_tools = chat_request_data[:tools].present?
          has_documents = params[:documents].present?
          has_search_queries = params[:is_search_queries_only] == true

          if has_conflicting_features?(has_tools, has_documents, has_search_queries)
            log_schema_warning(has_tools, has_documents, has_search_queries)
          else
            request_params[:response_format] = create_response_format(chat_request_data[:schema])
          end
        end

        def has_conflicting_features?(has_tools, has_documents, has_search_queries)
          has_tools || has_documents || has_search_queries
        end

        def log_schema_warning(has_tools, has_documents, has_search_queries)
          warning_reasons = []
          warning_reasons << 'tools' if has_tools
          warning_reasons << 'documents' if has_documents
          warning_reasons << 'search_queries_only' if has_search_queries

          RubyLLM.logger.debug 'Schema ignored: OCI response_format is not supported with ' \
                               "#{warning_reasons.join(', ')}. Consider including schema requirements " \
                               'in your system message instead.'
        end

        def build_chat_request(messages, temperature, tools, stream, schema = nil)
          {
            messages: messages,
            temperature: temperature,
            isStream: stream,
            tools: tools,
            schema: schema
          }
        end

        def build_chat_params(messages)
          chats = messages.map { |msg| create_cohere_message(msg) }

          tool_results = extract_tool_results_from_end(chats)
          return build_tool_response(tool_results, chats) if tool_results.present?

          last_message = chats.pop
          { message: last_message.message, chat_history: chats }
        end

        def extract_tool_results_from_end(chats)
          return [] unless chats.last&.role == 'TOOL'

          tool_results = []
          tool_results.concat(chats.pop.tool_results) while chats.last&.role == 'TOOL'
          tool_results
        end

        def build_tool_response(tool_results, chats)
          { message: '', tool_results: tool_results, chat_history: chats }
        end

        def create_cohere_message(msg)
          case msg[:role]
            when 'USER'
              OCI::GenerativeAiInference::Models::CohereUserMessage.new(
                role: 'USER',
                message: msg[:message].to_s
              )
            when 'CHATBOT'
              params = {
                role: 'CHATBOT',
                message: msg[:message].to_s
              }
              # Convert RubyLLM::ToolCall objects to CohereToolCall objects
              if msg[:tool_calls].present?
                params[:tool_calls] = convert_tool_calls_to_cohere(msg[:tool_calls])
              end

              OCI::GenerativeAiInference::Models::CohereChatBotMessage.new(params)
            when 'SYSTEM'
              OCI::GenerativeAiInference::Models::CohereSystemMessage.new(
                role: 'SYSTEM',
                message: msg[:message].to_s
              )
            when 'TOOL'
              tool_results = [
                OCI::GenerativeAiInference::Models::CohereToolResult.new(
                  call: create_basic_tool_call(msg[:tool_call_id], msg[:tool_call_name], msg[:tool_call_parameters]),
                  outputs: [parse_tool_content(msg[:message])]
                )
              ]

              OCI::GenerativeAiInference::Models::CohereToolMessage.new(
                tool_results: tool_results
              )
            else
              raise ArgumentError, "Unsupported message role: #{msg[:role]}"
          end
        end

        def convert_tool_calls_to_cohere(tool_calls)
          # tool_calls is a hash where values are RubyLLM::ToolCall objects
          tool_calls.values.map do |tool_call|
            OCI::GenerativeAiInference::Models::CohereToolCall.new(
              name: tool_call.name,
              parameters: tool_call.arguments
            )
          end
        end

        def create_basic_tool_call(tool_call_id, tool_call_name = nil, tool_call_parameters = nil)
          # Use provided tool_call_name or extract from tool_call_id as fallback
          tool_name = tool_call_name || tool_call_id.to_s.split('_')[0..-3].join('_')

          # Use provided parameters or empty hash as fallback
          parameters = tool_call_parameters || {}

          OCI::GenerativeAiInference::Models::CohereToolCall.new(
            name: tool_name,
            parameters: parameters
          )
        end

        def parse_tool_content(content)
          return content if content.is_a?(Hash) || content.is_a?(Array)

          # Tool result expects Object
          begin
            JSON.parse(content)
          rescue JSON::ParserError
            { 'result' => content }
          end
        end

        def format_cohere_tools(tools)
          tools.map do |tool|
            OCI::GenerativeAiInference::Models::CohereTool.new(
              name: tool[:name],
              description: tool[:description],
              parameter_definitions: format_tool_parameters(tool[:parameters])
            )
          end
        end

        def format_tool_parameters(parameters)
          return {} if parameters.blank?

          parameters.transform_keys(&:to_s).transform_values do |value|
            OCI::GenerativeAiInference::Models::CohereParameterDefinition.new(
              description: value[:description],
              type: value[:type],
              is_required: value[:required] || false
            )
          end
        end

        def extract_input_tokens(chat_response)
          chat_response.usage&.prompt_tokens || 0
        end

        def extract_output_tokens(chat_response)
          chat_response.usage&.completion_tokens || 0
        end

        def create_response_format(schema)
          formatted_schema = format_schema_for_oci(schema)

          OCI::GenerativeAiInference::Models::CohereResponseJsonFormat.new(
            schema: formatted_schema
          )
        end

        def format_schema_for_oci(schema)
          # RubyLLM wraps the schema as {name:, schema:, strict:}
          # OCI's CohereResponseJsonFormat expects just the inner JSON Schema object
          schema_def = schema[:schema] || schema['schema'] || schema

          cleaned = schema_def.dup
          cleaned.delete(:$defs)
          cleaned.delete('$defs')

          stringify_keys_recursively(cleaned)
        end

        def stringify_keys_recursively(obj)
          case obj
            when Hash
              obj.transform_keys(&:to_s).transform_values { |v| stringify_keys_recursively(v) }
            when Array
              obj.map { |item| stringify_keys_recursively(item) }
            when Symbol
              obj.to_s
            else
              obj
          end
        end
      end
    end
  end
end
# rubocop:enable Metrics/ModuleLength
