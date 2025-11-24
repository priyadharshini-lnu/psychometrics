# frozen_string_literal: true

module AI::IdpChat
  class CreateNewChatSession < BaseCommand
    private_attr_reader :user_idp_plan, :options

    def initialize(user_idp_plan, options = {})
      @user_idp_plan = user_idp_plan
      @options = options
    end

    def call
      AI::AssistableService::Idp.call(user_idp_plan, user_idp_plan.user, 'hi', options)

      broadcast(:ok, user_idp_plan.reload.ai_assisted_idp_session)
    end
  end
end
