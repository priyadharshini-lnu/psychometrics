# frozen_string_literal: true

FactoryBot.define do
  factory :microsite_user_assessment do
    user_assessment
    participant_id { SecureRandom.uuid }
    url { nil }
  end
end
