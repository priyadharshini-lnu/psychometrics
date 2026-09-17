# frozen_string_literal: true

FactoryBot.define do
  factory :voice_character, class: 'AI::VoiceCharacter' do
    sequence(:name) { |n| "Test Voice #{n}" }
    provider { 'azure' }
    external_voice_id { 'en-US-JennyNeural' }
    locale { 'en-US' }
    style { nil }
    rate { nil }
    pitch { nil }

    association :last_modified_by, factory: :user

    trait :with_tenant do
      association :tenant, factory: :tenancy
    end

    trait :with_style do
      style { 'cheerful' }
      rate { '+10%' }
      pitch { '+2st' }
    end
  end
end
