# frozen_string_literal: true

# rubocop:disable Metrics/ModuleLength
# Ref: https://docs.oracle.com/en-us/iaas/api/#/en/generative-ai-inference/20231130/datatypes/CohereChatRequest
module AI
  module Providers
    class Oci
      module Chat
        include Config
        include Tools

        DEFAULT_MAX_TOKENS = 600
        CITATION_QUALITY = 'FAST'
        SERVING_TYPE = 'ON_DEMAND'

        # rubocop:disable Metrics/ParameterLists, Lint/UnusedMethodArgument
        def render_payload(messages, tools:, temperature:, model: nil, stream: false, schema: nil)
          formatted_messages = format_messages(messages)
          formatted_tools = format_tools(tools)

          {
            compartmentId: oci_compartment_id,
            servingMode: {
              modelId: model_id,
              servingType: SERVING_TYPE
            },
            chatRequest: build_chat_request(formatted_messages, temperature, formatted_tools, stream)
          }
        end
        # rubocop:enable Metrics/ParameterLists, Lint/UnusedMethodArgument

        def sync_response(_connection, payload, headers)
          client = create_generative_ai_client

          chat_details = build_oci_chat_details(payload, headers)

          RubyLLM.logger.debug "OCI Chat Request: #{chat_details.to_hash}"

          response = client.chat(chat_details)

          RubyLLM.logger.debug "OCI Chat Response: #{response.data.to_hash}"

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
                { role: 'SYSTEM', message: msg.content.to_s }
              when :user
                { role: 'USER', message: msg.content.to_s }
              when :assistant
                data = { role: 'CHATBOT', message: msg.content.to_s }
                data[:tool_calls] = msg.tool_calls if msg.tool_call?
                data
              when :tool
                # Tool results will be handled separately by OCI API
                { role: 'TOOL', message: msg.content.to_s, tool_call_id: msg.tool_call_id }
            end
          end
        end

        private

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

          # Add default parameters
          request_params[:citation_quality] ||= CITATION_QUALITY

          # By default OCI doesn't have any specified limit mentioned that is internally used by the model
          # Through testing, we can see the limit is too low, setting it to 600 by default
          request_params[:max_tokens] ||= DEFAULT_MAX_TOKENS

          # Merge in params from RubyLLM.chat.with_params() - this allows users to override defaults
          request_params.merge!(params)

          # Add tools if present
          request_params[:tools] = format_cohere_tools(chat_request_data[:tools]) if chat_request_data[:tools].present?

          OCI::GenerativeAiInference::Models::CohereChatRequest.new(request_params)
        end

        def build_chat_request(messages, temperature, tools, stream)
          {
            messages: messages,
            temperature: temperature,
            isStream: stream,
            tools: tools
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
                  call: create_basic_tool_call(msg[:tool_call_id]),
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

        def create_basic_tool_call(tool_call_id)
          # Extract tool name from the tool_call_id if it follows a pattern
          # or you'll need to track this information differently
          tool_name = tool_call_id.to_s.split('_')[0..-3].join('_') # Remove the index and random part

          OCI::GenerativeAiInference::Models::CohereToolCall.new(
            name: tool_name,
            parameters: {} # This should be tracked with tool calls by RubyLLM
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

        def handle_oci_service_error(error)
          Rails.logger.error("OCI Generative AI Error: #{error}")

          error_message = extract_oci_error_message(error)

          case error.status_code
            when 400
              raise RubyLLM::BadRequestError.new(nil, error_message)
            when 401
              raise RubyLLM::UnauthorizedError.new(nil, error_message)
            when 403
              raise RubyLLM::ForbiddenError.new(nil, error_message)
            when 429
              raise RubyLLM::RateLimitError.new(nil, error_message)
            when 500
              raise RubyLLM::ServerError.new(nil, error_message)
            when 502, 503
              raise RubyLLM::ServiceUnavailableError.new(nil, error_message)
            when 529
              raise RubyLLM::OverloadedError.new(nil, error_message)
            else
              raise RubyLLM::Error.new(nil, error_message)
          end
        end

        def extract_oci_error_message(error)
          return "OCI Service Error: #{error.message}" if error.message.present?
          return "OCI Service Error (#{error.status_code})" if error.status_code.present?

          'OCI Service Error: Unknown error occurred'
        rescue StandardError
          'OCI Service Error: Unable to parse error message'
        end
      end
    end
  end
end
# rubocop:enable Metrics/ModuleLength
