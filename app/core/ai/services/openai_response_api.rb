# frozen_string_literal: true

require 'ruby_llm'

# TODO: This service is required till https://github.com/crmne/ruby_llm/pull/325 is merged and released
# rubocop:disable Metrics/ClassLength
module AI
  module Services
    class OpenaiResponseApi < BaseCommand
      class Error < StandardError; end

      private_attr_reader :assistant_chat, :model_id

      def initialize(llm_assistant_chat, model_id)
        @assistant_chat = llm_assistant_chat
        @model_id = model_id
      end

      def call
        validate_provider!

        response = make_api_request
        message = handle_response(response)

        broadcast(:ok, message)
      rescue Faraday::Error => e
        handle_connection_error(e)
      end

      private

      def validate_provider!
        unless assistant_chat.model&.provider == 'openai'
          raise Error, "Only OpenAI provider is supported for OpenaiResponseApi, got: #{assistant_chat.model&.provider}"
        end
      end

      def make_api_request
        connection.post do |req|
          req.url responses_endpoint
          req.headers = request_headers
          req.body = request_payload.to_json
        end
      rescue Faraday::TimeoutError => e
        raise Error, "Request timeout: #{e.message}"
      rescue Faraday::ConnectionFailed => e
        raise Error, "Connection failed: #{e.message}"
      rescue Faraday::SSLError => e
        raise Error, "SSL error: #{e.message}"
      end

      def connection
        @connection ||= Faraday.new(url: base_url) do |conn|
          conn.request :json
          conn.response :logger,
                        RubyLLM.logger,
                        bodies: false,
                        response: false,
                        errors: true,
                        headers: false,
                        log_level: :debug
          conn.use RubyLLM::ErrorMiddleware, provider: nil # Use RubyLLM::ErrorMiddleware directly for this connection
          conn.response :json, content_type: /\bjson$/
          conn.adapter Faraday.default_adapter

          # Add timeout configurations
          conn.options.timeout = 120      # 2 minutes total timeout
          conn.options.open_timeout = 30  # 30 seconds to establish connection
        end
      end

      def base_url
        # From: https://xyz.cognitiveservices.azure.com/openai/deployments/gpt-4o?api-version=2024-08-01-preview
        # To: https://xyz.cognitiveservices.azure.com/openai/v1
        original_base = ruby_llm_config.openai_api_base

        unless original_base
          raise Error, 'OpenAI API base URL is not configured'
        end

        base_part = original_base.split('/deployments/').first
        "#{base_part}/v1"
      end

      def responses_endpoint
        'responses'
      end

      def request_headers
        api_key = ruby_llm_config.openai_api_key

        unless api_key
          raise Error, 'OpenAI API key is not configured'
        end

        {
          'Content-Type' => 'application/json',
          'Authorization' => "Bearer #{api_key}",
          'api-key' => api_key # Azure OpenAI also uses api-key header
        }.compact
      end

      def request_payload
        {
          model: assistant_chat.model.id,
          input: format_messages,
          stream: false,
          store: false # By default we're storing the state in DB, this shouldn't be required
        }.tap do |payload|
          if assistant_chat.instance_variable_get(:@temperature)
            payload[:temperature] =
              assistant_chat.instance_variable_get(:@temperature)
          end
          payload[:tools] = format_tools if assistant_chat.tools.any?
          payload.merge!(map_params(assistant_chat.params)) if assistant_chat.params.any?
        end
      end

      def map_params(params)
        # response api uses different param names
        param_mapping = {
          max_tokens: :max_output_tokens
        }

        params.transform_keys { |key| param_mapping[key.to_sym] || key.to_sym }
      end

      def format_messages
        assistant_chat.messages.map do |message|
          formatted_message = {
            role: format_role(message.role),
            content: format_content(message.content)
          }

          # Add tool-specific fields if present
          formatted_message[:tool_calls] = message.tool_calls if message.tool_calls&.any?
          formatted_message[:tool_call_id] = message.tool_call_id if message.tool_call_id

          formatted_message.compact
        end
      end

      def format_role(role)
        case role.to_sym
          when :system
            ruby_llm_config.openai_use_system_role ? 'system' : 'developer'
          else
            role.to_s
        end
      end

      def format_content(content)
        case content
          when String
            content
          when RubyLLM::Content
            format_rich_content(content)
          else
            content.respond_to?(:to_s) ? content.to_s : content
        end
      end

      def format_rich_content(content)
        parts = []

        # Add text part if present
        parts << { type: 'input_text', text: content.text } if content.text

        # Add PDF attachment parts
        content.attachments.each do |attachment|
          parts << format_attachment(attachment)
        end

        parts.length == 1 && parts.first[:type] == 'input_text' ? parts.first[:text] : parts
      end

      def format_attachment(attachment)
        case attachment.type
          when :pdf
            format_pdf_attachment(attachment)
          else
            raise Error, "Only PDF attachments are supported in Response API, got: #{attachment.type}"
        end
      end

      def format_pdf_attachment(attachment)
        file_url = if attachment.url?
                     attachment.source.to_s
                   else
                     "data:#{attachment.mime_type};base64,#{attachment.encoded}"
                   end

        {
          type: 'input_file',
          file_url: file_url
        }
      end

      def format_tools
        assistant_chat.tools.map do |_, tool|
          {
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }
          }
        end
      end

      def handle_response(response)
        if response.success?
          create_message_from_response(response.body)
        else
          handle_error_response(response)
        end
      end

      def create_message_from_response(response_data)
        message_data = response_data.dig('output', 0)
        unless message_data
          raise Error, 'No message data found in response output'
        end

        content = extract_content_from_output(message_data)

        message_attributes = {
          role: :assistant,
          content: content,
          tool_calls: parse_tool_calls(message_data['tool_calls']),
          input_tokens: response_data.dig('usage', 'input_tokens'),
          output_tokens: response_data.dig('usage', 'output_tokens'),
          model_id: response_data['model']
        }

        message = assistant_chat.add_message(message_attributes)

        if message.tool_call?
          handle_tool_calls(message)
        end

        message
      end

      def extract_content_from_output(message_data)
        content_array = message_data['content']
        return nil unless content_array&.any?

        text_parts = content_array.filter_map do |content_part|
          # Some model can output image or audio, we only want text here
          content_part['text'] if content_part['type'] == 'output_text'
        end

        text_parts.join("\n").strip
      end

      def parse_tool_calls(tool_calls_data)
        return nil unless tool_calls_data&.any?

        tool_calls_data.map do |tc|
          RubyLLM::ToolCall.new(
            id: tc['id'],
            name: tc.dig('function', 'name'),
            arguments: JSON.parse(tc.dig('function', 'arguments') || '{}')
          )
        end
      rescue JSON::ParserError => e
        raise Error, "Failed to parse tool call arguments: #{e.message}"
      end

      def handle_tool_calls(message)
        message.tool_calls.each do |tool_call|
          tool = assistant_chat.tools[tool_call.name.to_sym]
          next unless tool

          result = tool.call(tool_call.arguments)
          assistant_chat.add_message(
            role: :tool,
            content: result.to_s,
            tool_call_id: tool_call.id
          )
        end
      rescue StandardError => e
        raise Error, "Failed to handle tool calls: #{e.message}"
      end

      def handle_error_response(response)
        error_message = extract_error_message(response)

        case response.status
          when 400
            raise Error, "Bad Request (400): #{error_message}"
          when 401
            raise Error, "Unauthorized (401): Check your API key. #{error_message}"
          when 403
            raise Error, "Forbidden (403): #{error_message}"
          when 404
            raise Error, "Not Found (404): Check your endpoint URL. #{error_message}"
          when 429
            raise Error, "Rate Limited (429): #{error_message}"
          when 500..599
            raise Error, "Server Error (#{response.status}): #{error_message}"
          else
            raise Error, "HTTP Error (#{response.status}): #{error_message}"
        end
      end

      def extract_error_message(response)
        return 'Unknown error' unless response.body

        if response.body.is_a?(Hash)
          response.body.dig('error', 'message') ||
            response.body['message'] ||
            response.body.to_s
        else
          response.body.to_s
        end
      rescue StandardError
        'Unable to parse error message'
      end

      def handle_connection_error(error)
        case error
          when Faraday::TimeoutError
            raise Error, 'Request timeout: The API request took too long to complete'
          when Faraday::ConnectionFailed
            raise Error, 'Connection failed: Unable to connect to the OpenAI API'
          when Faraday::SSLError
            raise Error, 'SSL error: There was a problem with the SSL connection'
          else
            raise Error, "Network error: #{error.message}"
        end
      end

      def ruby_llm_config
        @ruby_llm_config ||= begin
          provider_config = Settings.ai_providers.find { |provider| provider['model_id'] == model_id }
          context = provider_config&.dig('context').to_h

          config_class = Struct.new(*context.keys.map(&:to_sym), :openai_use_system_role, keyword_init: true)
          config = config_class.new(**context.transform_keys(&:to_sym))
          config.openai_use_system_role = true unless config.respond_to?(:openai_use_system_role) &&
                                                      config.openai_use_system_role
          config
        end
      end
    end
  end
end
# rubocop:enable Metrics/ClassLength
