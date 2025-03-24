# frozen_string_literal: true

module DevelopmentActions
  module Services
    class AzureOpenai
      attr_reader :system_prompt, :user_prompt

      def initialize(system_prompt, user_prompt)
        @config = Settings.secrets.azure_openai
        @system_prompt = system_prompt
        @user_prompt = user_prompt
      end

      def generate!
        response = client.post("openai/deployments/#{@config[:deployment]}/chat/completions") do |req|
          req.headers['Content-Type'] = 'application/json'
          req.headers['api-key'] = @config[:api_key]
          req.body = {
            messages: [
              {
                role: 'system',
                content: system_prompt
              },
              {
                role: 'user',
                content: user_prompt
              }
            ],
            response_format: { type: 'json_object' } # Ensures JSON response
          }.to_json
        end

        parse_and_sanitize_response(response.body)
      rescue Faraday::Error => e
        error_details = e.response[:body] if e.respond_to?(:response) && e.response.present?
        full_error_message = { error: "API request failed: #{e.message}", details: error_details }

        raise Faraday::Error, full_error_message.to_s
      end

      private

      def client
        @client ||= Faraday.new(url: @config[:endpoint]) do |f|
          f.request :json
          f.response :json
          f.response :raise_error
          f.adapter Faraday.default_adapter
          f.params['api-version'] = @config[:api_version]
        end
      end

      def parse_and_sanitize_response(response_body)
        return [] unless response_body

        content = response_body.dig('choices', 0, 'message', 'content')

        return [] unless content

        parsed_content = JSON.parse(content)
        recommendations = parsed_content['recommendations']

        return [] unless recommendations

        recommendations.map do |rec|
          {
            'description' => sanitize_text(rec['description']),
            'learning_style' => validate_learning_style(rec['learning_style'])
          }
        end
      end

      def sanitize_text(text)
        return '' unless text.is_a?(String)

        # Remove any control characters and normalize whitespace
        text.gsub(/[[:cntrl:]]/, '').
          gsub(/\s+/, ' ').
          strip
      end

      def validate_learning_style(style)
        valid_styles = %w[structured_learning learning_from_others on_the_job]
        valid_styles.include?(style) ? style : 'structured_learning'
      end
    end
  end
end
