# frozen_string_literal: true

module AI
  class AssistantService < BaseCommand
    private_attr_reader :assistant_id, :prompt, :current_user, :options, :chat, :chat_params, :ignore_user_prompt

    def initialize(assistant_id, current_user, prompt = nil, options = {})
      @assistant_id = assistant_id
      @prompt = prompt
      @current_user = current_user
      @options = options
      @chat = options[:chat]
      @chat_params = options[:chat_params] || {}
      @ignore_user_prompt = options[:ignore_user_prompt] || false
    end

    def call
      # TODO: Add license check
      broadcast(:ok, response)
    rescue RubyLLM::Error, AI::Services::OpenaiResponseApi::Error => e
      broadcast(:error, e.message)
    end

    private

    def response
      active_chat = chat || create_new_chat
      res = active_chat.ask(user_prompt.strip, **chat_params)

      {
        message: res.content,
        input_tokens: res.input_tokens,
        output_tokens: res.output_tokens
      }
    end

    def create_new_chat
      tools = options[:tools] || []
      assistant.for_user(current_user, tools: tools)
    end

    def user_prompt
      base_prompt = ignore_user_prompt ? '' : assistant.user_prompt

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
