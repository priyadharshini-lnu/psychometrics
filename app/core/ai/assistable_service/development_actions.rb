# frozen_string_literal: true

module AI
  module AssistableService
    class DevelopmentActions < Base
      class GenerateLimitReachedError < StandardError; end

      MAXIMUM_GENERATION_LIMIT = 5

      private_attr_reader :user_idp_skill, :options

      def initialize(user_idp_skill, current_user, options = {})
        @options = options
        @user_idp_skill = user_idp_skill
        super(user_idp_skill, current_user, prompt_data, options.merge(ignore_user_prompt: false))
      end

      def call
        unless assistable_enabled?
          return broadcast(:error,
                           I18n.t('administration.ai_assistants.errors.development_actions_assistance_not_enabled'))
        end

        validate_generation_request_under_limit!

        mark_session_in_progress!
        assistant_service.
          on(:ok) do |assistant_response|
            handle_assistant_service_success(assistant_response)
          end.
          on(:error) do |error_message, error|
            handle_assistant_service_error(error_message, error)
          end.
          call
      rescue GenerateLimitReachedError => e
        broadcast(:error, e.message)
      end

      private

      def handle_assistant_service_error(error_message, error = nil)
        error_response, error_meta = handle_assistant_error_response(error_message, error)
        mark_session_failed!(error_response, meta: error_meta)
        broadcast(:error, error_response)
      end

      def handle_assistant_service_success(assistant_response)
        response_data = assistant_response[:message]
        generated_actions = response_data['recommendations'] || []

        save_and_mark_session_complete!(generated_actions)
        broadcast(:ok, generated_actions)
      end

      def assistant
        # Platform level assistant for development actions, always will be one
        # TODO: In future load it from the place where it is configured for individual IDP
        @assistant ||= AI::Assistant.where(assistant_type: :development_actions_assistant).first
      end

      def assistant_context
        <<~CONTEXT
          <user_idp_skill id="#{user_idp_skill.id}">
            <skill_name>#{skill.name}</skill_name>
            <skill_description>#{skill.description}</skill_description>
            <skill_type>#{skill.skill_type}</skill_type>
          </user_idp_skill>
        CONTEXT
      end

      def assistant_tools
        []
      end

      def session_model
        AI::AssistedUserDevelopmentActionsSession
      end

      def assistable_enabled?
        assistant.present?
      end

      def prompt_data
        <<~CONTEXT
          Generation Language: #{generation_language}

          #{added_development_actions}
        CONTEXT
      end

      def generation_language
        I18n.t("languages.#{options[:lang] || 'en'}")
      end

      def skill
        @skill ||= user_idp_skill.skill
      end

      def added_development_actions
        actions_data = user_idp_skill.development_actions.map do |development_action|
          {
            id: development_action.id,
            name: development_action.name,
            description: development_action.description,
            learning_style: development_action.learning_style,
            development_action_type: development_action.development_action_type
          }
        end

        <<~ACTIONS
          <added_development_actions>
          #{actions_data}
          </added_development_actions>
        ACTIONS
      end

      def validate_generation_request_under_limit!
        assistant_response_count = session.messages.where(role: 'assistant').where.missing(:tool_calls).count

        if assistant_response_count >= MAXIMUM_GENERATION_LIMIT
          raise GenerateLimitReachedError,
                I18n.t('errors.ai_assistant.max_generation_limit')
        end
      end

      def save_and_mark_session_complete!(generated_actions)
        previously_generated_actions = session.development_actions || []
        updated_actions = previously_generated_actions + generated_actions
        mark_session_completed!(updated_actions)
      end
    end
  end
end
