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
      unless one_click_idp_assistance_enabled?
        return broadcast(:error,
                         I18n.t('administration.ai_assistants.errors.one_click_idp_assistance_not_enabled'))
      end

      assistant_service = AssistantService.new(
        idp_assistant.id,
        current_user,
        instructions,
        chat: chat_with_session_context
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
    end

    private

    def idp_assistant
      @idp_assistant ||= idp_template.one_click_ai_assistant
    end

    def document_analysis_assistant
      @document_analysis_assistant ||= idp_template.document_analysis_ai_assistant
    end

    def idp_template
      @idp_template ||= plan.idp_template
    end

    def one_click_idp_assistance_enabled?
      idp_template.one_click_idp_enabled
    end

    def chat_with_session_context
      idp_assisted_session_chat.
        with_assistant_context(tools: idp_assistant_tools)
    end

    def idp_assisted_session_chat
      @idp_assisted_session_chat ||= ai_assisted_idp_session.ai_assistant_chat
    end

    def create_ai_assisted_idp_session!
      chat = idp_assistant.for_user(current_user, contextual_information: idp_context)
      plan.create_ai_assisted_idp_session!(ai_assistant_chat: chat, user: current_user)
    end

    def ai_assisted_idp_session
      plan.ai_assisted_idp_session || create_ai_assisted_idp_session!
    end

    def idp_assistant_tools
      [
        AI::Tools::UserIdpDocAnalyzer.new(plan, current_user, document_analysis_assistant),
        AI::Tools::UserIdpCreator.new(plan)
      ]
    end

    def idp_context
      <<~CONTEXT
        #{user_dependency.parse}
        #{plan_dependency}
      CONTEXT
    end

    def user_dependency
      AI::Utils::DependencyParser::UserData.new(
        current_user,
        custom_fields: %w[role department organization entity]
      )
    end

    def plan_dependency
      <<~CONTEXT
        <user_idp_document>
          <filename>#{user_idp_document.filename}</filename>
          <document_analysis_status>#{ai_assisted_user_document_summary&.status}</document_analysis_status>
        </user_idp_document>
      CONTEXT
    end

    def user_idp_document
      @user_idp_document ||= plan.user_document
    end

    def ai_assisted_user_document_summary
      @ai_assisted_user_document_summary ||= user_idp_document.ai_assisted_user_document_summary
    end
  end
end
