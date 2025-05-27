# frozen_string_literal: true

module AI
  module Assistants
    class Service < BaseCommand
      private_attr_reader :assistant_id, :prompt_data

      # TODO(sritabh): Extra prompt data is only good for playground, add safeguard against what should be passed.
      def initialize(assistant_id, prompt_data = nil)
        @assistant_id = assistant_id
        @prompt_data = prompt_data
      end

      def call
        response = ::AI::Providers::Client.call!(
          provider_id: assistant.provider_id,
          system_prompt: assistant.system_prompt,
          user_prompt: user_prompt
        )
        broadcast(:ok, response)
      end

      private

      def user_prompt
        if prompt_data.present?
          "#{assistant.user_prompt} <data>#{prompt_data}<data>".strip
        else
          assistant.user_prompt
        end
      end

      def assistant
        @assistant ||= ::AI::Assistant.find(assistant_id)
      end
    end
  end
end
