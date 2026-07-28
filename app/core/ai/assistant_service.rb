# frozen_string_literal: true

module AI
  class AssistantService < BaseCommand
    private_attr_reader :assistant_id, :prompt, :current_user, :options, :chat, :ask_params, :ignore_user_prompt,
                        :max_retry_count, :session, :response_validators

    def initialize(assistant_id, current_user, prompt = nil, options = {})
      @assistant_id = assistant_id
      @prompt = prompt
      @current_user = current_user
      @options = options
      @chat = options[:chat]
      @session = options[:session]
      @ask_params = options[:ask_params] || {} # Parameters for the request api service
      @ignore_user_prompt = options[:ignore_user_prompt] || false
      @validate_response_structure = options[:validate_response_structure] || false
      @response_validators = options[:response_validators] || []
      @max_retry_count = options[:max_retry_count] || 3
    end

    def call
      # TODO: Add license check
      ask_assistant
    rescue RubyLLM::Error, AI::Services::OpenaiResponseApi::Error => e
      mark_last_request_failed(e.message, e)
      broadcast(:error, e.message, e)
    end

    def retry_last_request
      complete_chat_request
    rescue RubyLLM::Error, AI::Services::OpenaiResponseApi::Error => e
      mark_last_request_failed(e.message, e)
      broadcast(:error, e.message, e)
    end

    private

    def ask_assistant
      response = active_chat.ask(user_prompt.strip, **ask_params)
      validate_and_retry_response(response)
    end

    def complete_chat_request
      response = active_chat.complete
      validate_and_retry_response(response)
    end

    def validate_and_retry_response(response)
      validation_message = nil

      max_retry_count.times do
        validation_message = validate_response(response.content)
        break if validation_message.nil?

        mark_last_request_invalid(validation_message)

        response = active_chat.ask_for_correction(
          "Error: System cannot render the message to user: #{validation_message}"
        )
      end

      if validation_message.nil?
        broadcast(:ok, response_chat(response))
      else
        mark_last_request_invalid(validation_message)
        broadcast(:error, I18n.t('admin.assistant_validation_failed'))
      end
    end

    def validate_response(response)
      return nil unless @validate_response_structure

      parsed_response = response.is_a?(String) ? JSON.parse(response) : response
      assistant.output_schema_class.validate_response(parsed_response)

      response_validators.each do |validator|
        error = validator.validate(parsed_response)
        raise AI::OutputSchemas::Base::InvalidResponseStructureError, error if error.present?
      end

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
        output_tokens: response.output_tokens,
        thinking_tokens: response.thinking_tokens
      }
    end

    def active_chat
      @active_chat ||= chat || create_new_chat
    end

    def create_new_chat
      tools = options[:tools] || []
      params = options[:params] # Params for the requests
      skip_default_params = options[:skip_default_params] || false
      prompt_template_context = options[:prompt_template_context] || {}
      chat = assistant.for_user(
        current_user,
        tools: tools,
        params: params,
        prompt_template_context: prompt_template_context,
        contextual_information: options[:contextual_information],
        skip_default_params: skip_default_params
      )
      chat.update!(ai_assisted_user_session: session) if session.present?

      chat
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

    def mark_last_request_invalid(error_message)
      last_chat_request&.mark_invalid!(error_message)
    end

    def mark_last_request_failed(error_message, error = nil)
      last_chat_request&.mark_failed!(error_message, error: error)
    end

    def last_chat_request
      active_chat.messages.last
    end
  end
end
