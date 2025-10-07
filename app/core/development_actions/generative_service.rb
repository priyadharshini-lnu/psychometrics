# frozen_string_literal: true

module DevelopmentActions
  class GenerativeService < BaseCommand
    attr_reader :user_idp_skill, :current_user, :generate_more, :options

    def initialize(user_idp_skill, current_user, options = {})
      @user_idp_skill = user_idp_skill
      @current_user = current_user
      @generate_more = options[:generate_more]
      @options = options
    end

    def call
      if generate_more
        # Always call assistable service when generating more
        call_assistable_service
      else
        # Try to load existing session development actions instead of generating for the user
        existing_actions = generated_session_actions
        if existing_actions.present?
          broadcast(:ok, existing_actions)
        else
          call_assistable_service
        end
      end
    end

    private

    def call_assistable_service
      assistant_service.
        on(:ok) do
          broadcast(:ok, generated_session_actions)
        end.
        on(:error) do |error_message|
          broadcast(:error, error_message)
        end.
        call
    end

    def assistant_service
      @assistant_service ||= AI::AssistableService::DevelopmentActions.new(user_idp_skill, current_user, options)
    end

    def generated_session_actions
      assistant_session.development_actions || []
    end

    def assistant_session
      @assistant_session ||= assistant_service.session
    end
  end
end
