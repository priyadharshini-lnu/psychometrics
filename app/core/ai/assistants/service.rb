# frozen_string_literal: true

module AI
  module Assistants
    class Service < BaseCommand
      def initialize(assistant_id)
        @assistant_id = assistant_id
      end

      def call
        assistant = ::AI::Assistant.find(@assistant_id)

        ::AI::Providers::Client.call(
          provider_id: assistant.provider_id,
          system_prompt: assistant.system_prompt,
          user_prompt: assistant.user_prompt
        )
      end
    end
  end
end
