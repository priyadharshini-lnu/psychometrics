# frozen_string_literal: true

module AI
  class IdpAssistantService < BaseCommand
    private_attr_reader :plan, :instructions, :current_user, :options

    def initialize(plan, current_user, instructions = nil, options = {})
      @plan = plan
      @instructions = instructions
      @current_user = current_user
      @options = options
    end

    def call
      assistant_service = AssistantService.new(
        idp_assistant.id,
        current_user,
        instructions,
        chat: chat_with_session_context,
        tools: idp_assistant_tools
      )
      ai_assisted_idp_session.mark_as_in_progress!

      assistant_service.
        on(:ok) do |assistant_response|
          ai_assisted_idp_session.mark_as_completed!
          broadcast(:ok, {
            content: assistant_response[:message],
            role: 'assistant'
          })
        end.
        on(:error) do |error_message|
          ai_assisted_idp_session.mark_as_failed!(error_message)
          broadcast(:error, error_message)
        end.
        call
    rescue RubyLLM::Error => e
      ai_assisted_idp_session&.mark_as_failed!(e.message)
      broadcast(:error, e.message)
    end

    private

    def idp_assistant
      # TODO: Check if the feature is available
      @idp_assistant ||= idp_template.one_click_ai_assistant
    end

    def idp_template
      @idp_template ||= plan.idp_template
    end

    def one_click_idp_assistance_enabled?
      idp_template.one_click_idp_enabled
    end

    def chat_with_session_context
      idp_assisted_session_chat.
        with_assistant_context(tools: idp_assistant_tools, params: idp_assistant_llm_params).
        with_temperature(0) # TODO: Lowering temperature makes it deterministic, keeping the structure to be followed
    end

    def idp_assisted_session_chat
      @idp_assisted_session_chat ||= ai_assisted_idp_session.ai_assistant_chat
    end

    def create_ai_assisted_idp_session!
      chat = idp_assistant.for_user(current_user)
      plan.create_ai_assisted_idp_session!(ai_assistant_chat: chat, user: current_user)
    end

    def ai_assisted_idp_session
      plan.ai_assisted_idp_session || create_ai_assisted_idp_session!
    end

    def idp_assistant_tools
      [AI::Tools::UserIdpDocAnalyzer.new(plan, current_user)]
    end

    def idp_assistant_llm_params
      { response_format: { type: 'json_object' } }
    end
  end
end
