# frozen_string_literal: true

module AI::IdpChat
  class CreateNewChatSession < BaseCommand
    private_attr_reader :user_idp_plan, :options

    def initialize(user_idp_plan, options = {})
      @user_idp_plan = user_idp_plan
      @options = options
    end

    def call
      assistable_service = AI::AssistableService::Idp.new(user_idp_plan, user_idp_plan.user, 'hi', options)
      assistable_service.on(:ok) do
        broadcast(:ok, user_idp_plan.reload.ai_assisted_idp_session)
      end.
        on(:error) do |error_message, _error|
        broadcast(:error, error_message)
      end.
        call
    end
  end
end
