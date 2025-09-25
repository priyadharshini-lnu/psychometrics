# frozen_string_literal: true

module AI
  class IdpAssistantService < BaseCommand
    include AI::Concerns::ErrorHandler

    private_attr_reader :plan, :instructions, :current_user, :options, :start_new_chat

    def initialize(plan, current_user, instructions = nil, options = {})
      @plan = plan
      @instructions = instructions
      @current_user = current_user
      @options = options
      @start_new_chat = options[:start_new_chat] || false
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
        chat: chat_with_session_context,
        ignore_user_prompt: true
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
        on(:error) do |error_message, error|
          error_response, error_meta = handle_assistant_error_response(error_message, error)
          ai_assisted_idp_session.mark_as_failed!(error_response, meta: error_meta)
          broadcast(:error, error_response)
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

    def ai_assisted_idp_session
      @ai_assisted_idp_session ||= begin
        session = AI::AssistedUserIdpSession.find_or_initialize_by(assistable: plan, user: current_user)

        # Create new chat if flag is set or session is new
        if start_new_chat || session.new_record?
          mark_plan_in_ai_assisted_idp_in_progress! if session.new_record?
          chat = idp_assistant.for_user(current_user, contextual_information: idp_context)
          session.ai_assistant_chat = chat
          session.save! if session.new_record?
        end

        session
      end
    end

    def mark_plan_in_ai_assisted_idp_in_progress!
      plan.update!(status: :ai_assisted_idp_in_progress) unless plan.ai_assisted_idp_in_progress?
    end

    def idp_assistant_tools
      [
        AI::Tools::Idp::DocumentAnalyzer.new(plan, current_user, document_analysis_assistant),
        AI::Tools::Idp::AddSkillToPlan.new(plan),
        AI::Tools::Idp::AvailableSkillsAndDevelopmentActions.new(idp_template)
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
