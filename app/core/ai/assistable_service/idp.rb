# frozen_string_literal: true

module AI
  module AssistableService
    class Idp < Base
      def initialize(plan, current_user, instructions = nil, options = {})
        super(plan, current_user, instructions, options.merge(ignore_user_prompt: true))
      end

      def call
        unless assistable_enabled?
          return broadcast(:error,
                           I18n.t('administration.ai_assistants.errors.one_click_idp_assistance_not_enabled'))
        end

        mark_session_in_progress!

        assistant_service.
          on(:ok) do |assistant_response|
            handle_assistant_service_success(assistant_response)
          end.
          on(:error) do |error_message, error|
            handle_assistant_service_error(error_message, error)
          end.
          call
      end

      private

      def handle_assistant_service_error(error_message, error = nil)
        error_response, error_meta = handle_assistant_error_response(error_message, error)
        mark_session_failed!(error_response, meta: error_meta)
        broadcast(:error, error_response)
      end

      def handle_assistant_service_success(assistant_response)
        mark_session_completed!
        broadcast(:ok, {
          content: assistant_response[:message],
          role: 'assistant'
        })
      end

      def assistant
        @assistant ||= idp_template.one_click_ai_assistant
      end

      def assistant_context
        <<~CONTEXT
          #{user_dependency.parse}
          #{plan_dependency}
        CONTEXT
      end

      def assistant_tools
        [
          AI::Tools::Idp::AttachmentAnalysis.new(assistable, current_user, document_analysis_assistant),
          AI::Tools::Idp::AddSkillToPlan.new(assistable),
          AI::Tools::Idp::AvailableSkillsAndDevelopmentActions.new(idp_template)
        ]
      end

      def session_model
        AI::AssistedUserIdpSession
      end

      def assistable_enabled?
        idp_template.one_click_idp_enabled
      end

      def document_analysis_assistant
        @document_analysis_assistant ||= idp_template.document_analysis_ai_assistant
      end

      def mark_assistable_in_progress!
        assistable.update!(status: :ai_assisted_idp_in_progress) unless assistable.ai_assisted_idp_in_progress?
      end

      def idp_template
        @idp_template ||= assistable.idp_template
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
        @user_idp_document ||= assistable.user_document
      end

      def ai_assisted_user_document_summary
        @ai_assisted_user_document_summary ||= user_idp_document.ai_assisted_user_document_summary
      end
    end
  end
end
