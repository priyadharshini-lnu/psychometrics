# frozen_string_literal: true

module AI
  class AssistantService < BaseCommand
    private_attr_reader :assistant_id, :prompt, :current_user, :options

    def initialize(assistant_id, current_user, prompt = nil, options = {})
      @assistant_id = assistant_id
      @prompt = prompt
      @current_user = current_user
      @options = options
    end

    def call
      # TODO: Add license check
      broadcast(:ok, response)
    rescue RubyLLM::Error => e
      broadcast(:error, e.message)
    end

    private

    def response
      chat = assistant.for_user(current_user)
      tools = options[:tools] || []
      chat = chat.with_tools(*tools)

      res = chat.ask(user_prompt.strip)

      {
        message: res.content,
        input_tokens: res.input_tokens,
        output_tokens: res.output_tokens
      }
    end

    def user_prompt
      base_prompt = assistant.user_prompt

      if prompt.present?
        <<~USER_PROMPT
          #{base_prompt}
          #{prompt}
        USER_PROMPT
      else
        base_prompt
      end
    end

    def assistant
      @assistant ||= ::AI::Assistant.find(assistant_id)
    end
  end
end
