# frozen_string_literal: true

module AI
  module Providers
    class AzureOpenai
      attr_reader :system_prompt, :user_prompt, :model

      def initialize(config, system_prompt, user_prompt, _model = nil)
        @config = config
        @system_prompt = system_prompt
        @user_prompt = user_prompt
      end

      def call!
        res = client.post do |req|
          req.headers['Content-Type'] = 'application/json'
          req.headers['api-key'] = @config.api_key
          req.body = {
            messages: [
              { role: 'system', content: system_prompt },
              { role: 'user', content: user_prompt }
            ]
          }.to_json
        end

        parse_response(res)
      rescue Faraday::Error => e
        parse_error_response(e)
      end

      private

      def client
        @client ||= Faraday.new(url: @config.endpoint) do |f|
          f.request :json
          f.response :json
          f.response :raise_error
          f.adapter Faraday.default_adapter
        end
      end

      def parse_response(response)
        body = response.body
        {
          input_tokens: body.dig('usage', 'prompt_tokens'),
          output_tokens: body.dig('usage', 'completion_tokens'),
          total_tokens: body.dig('usage', 'total_tokens'),
          response: body.dig('choices', 0, 'message', 'content'),
          success: true
        }
      end

      def parse_error_response(error)
        error_body = error.response[:body] if error.respond_to?(:response) && error.response.present?

        error_message = 'Unknown error'
        if error_body.present?
          begin
            error_message = JSON.parse(error_body).dig('error', 'message') || error.message
          rescue JSON::ParserError
            error_message = error_body.to_s
          end
        end

        error_response = {
          success: false,
          status: error.respond_to?(:response) ? error.response[:status] : nil,
          message: error.message,
          response: error_message
        }

        Rails.logger.error("Azure OpenAI error: #{error_body}")
        error_response
      end
    end
  end
end
