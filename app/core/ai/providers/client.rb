# frozen_string_literal: true

module AI
  module Providers
    class Client < BaseCommand
      def initialize(provider_id:, system_prompt:, user_prompt:)
        @provider_id = provider_id
        @system_prompt = system_prompt
        @user_prompt = user_prompt
      end

      def call
        provider_config = find_provider_config(@provider_id)
        result = provider_instance(provider_config).call!

        if result[:success]
          result[:response]
        else
          raise "AI Provider error: #{result[:message]}"
        end
      end

      private

      def provider_instance(provider_config)
        provider_class(provider_config).new(provider_config, @system_prompt, @user_prompt)
      end

      def provider_class(provider_config)
        provider_name = provider_config.provider

        begin
          AI::Providers.const_get(provider_name)
        rescue NameError
          AzureOpenai
        end
      end

      def find_provider_config(provider_id)
        config = Settings.ai_providers.find { |p| p.id == provider_id }
        raise "Provider configuration not found for ID: #{provider_id}" unless config

        config
      end
    end
  end
end
