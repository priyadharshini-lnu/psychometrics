# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_idp_session, class: 'AI::AssistedUserIdpSession' do
    association :user
    association :assistable, factory: :user_idp_plan
    association :ai_assistant_chat, factory: :assistant_chat
  end
end
