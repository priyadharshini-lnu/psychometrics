# frozen_string_literal: true

module AI
  class AssistantService < BaseCommand
    private_attr_reader :assistant_id, :prompt_data, :current_user

    # TODO(sritabh): Extra prompt data is only good for playground, add safeguard against what should be passed.
    def initialize(assistant_id, current_user, prompt_data = nil)
      @assistant_id = assistant_id
      @prompt_data = prompt_data
      @current_user = current_user
    end

    def call
      broadcast(:ok, response)
    rescue RubyLLM::Error => e
      broadcast(:error, "AI Error: #{e.message}")
    end

    private

    def response
      chat = assistant.for_user(current_user)
      res = chat.ask(user_prompt)

      {
        message: res.content,
        input_tokens: res.input_tokens,
        output_tokens: res.output_tokens
      }
    end

    def user_prompt
      base_prompt = assistant.user_prompt

      if prompt_data.present?
        "#{base_prompt} <data>#{prompt_data}</data>".strip
      else
        base_prompt
      end
    end

    def assistant
      @assistant ||= ::AI::Assistant.find(assistant_id)
    end
  end
end
