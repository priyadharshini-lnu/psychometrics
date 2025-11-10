# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_idp_session, class: 'AI::AssistedUserIdpSession' do
    association :user
    association :assistable, factory: :user_idp_plan

    trait :with_chat do
      after(:create) do |session|
        create(:assistant_chat, ai_assisted_user_session: session)
      end
    end
  end
end
