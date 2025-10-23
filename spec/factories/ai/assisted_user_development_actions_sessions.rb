# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_development_actions_session, class: 'AI::AssistedUserDevelopmentActionsSession' do
    association :user
    association :assistable, factory: :user_idp_skill
    association :ai_assistant_chat, factory: :assistant_chat
  end
end
