# frozen_string_literal: true

module AI
  class AssistantService < BaseCommand
    private_attr_reader :assistant_id, :prompt, :current_user, :options, :chat, :ask_params, :ignore_user_prompt,
                        :max_retry_count

    def initialize(assistant_id, current_user, prompt = nil, options = {})
      @assistant_id = assistant_id
      @prompt = prompt
      @current_user = current_user
      @options = options
      @chat = options[:chat]
      @ask_params = options[:ask_params] || {} # Parameters for the request api service
      @ignore_user_prompt = options[:ignore_user_prompt] || false
      @validate_response_structure = options[:validate_response_structure] || false
      @max_retry_count = options[:max_retry_count] || 3
    end

    def call
      # TODO: Add license check
      ask_assistant
    rescue RubyLLM::Error, AI::Services::OpenaiResponseApi::Error => e
      broadcast(:error, e.message, e)
    end

    private

    def ask_assistant
      active_chat = chat || create_new_chat
      response = active_chat.ask(user_prompt.strip, **ask_params)
      validation_message = nil

      max_retry_count.times do
        validation_message = validate_response(response.content)
        break if validation_message.nil?

        active_chat.with_instructions(
          "Error: System cannot render the message to user: #{validation_message}"
        )
        response = active_chat.complete

        validation_message = validate_response(response.content)
      end

      if validation_message.nil?
        broadcast(:ok, response_chat(response))
      else
        broadcast(:error, I18n.t('admin.assistant_validation_failed'))
      end
    end

    def validate_response(response)
      return nil unless @validate_response_structure

      parsed_response = JSON.parse(response)
      assistant.output_schema_class.validate_response(parsed_response)

      nil
    rescue JSON::ParserError => e
      "#{e.message}, Response is not a valid JSON"
    rescue AI::OutputSchemas::Base::InvalidResponseStructureError => e
      e.message
    end

    def response_chat(response)
      {
        message: response.content,
        input_tokens: response.input_tokens,
        output_tokens: response.output_tokens
      }
    end

    def create_new_chat
      tools = options[:tools] || []
      params = options[:params] # Params for the requests
      prompt_template_context = options[:prompt_template_context] || {}
      assistant.for_user(current_user, tools: tools, params: params, prompt_template_context: prompt_template_context)
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
