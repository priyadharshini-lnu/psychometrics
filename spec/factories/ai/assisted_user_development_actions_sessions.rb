# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_development_actions_session, class: 'AI::AssistedUserDevelopmentActionsSession' do
    association :user
    association :assistable, factory: :user_idp_skill

    trait :with_chat do
      after(:create) do |session|
        create(:assistant_chat, ai_assisted_user_session: session)
      end
    end
  end
end
