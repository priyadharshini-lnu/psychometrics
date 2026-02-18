# frozen_string_literal: true

FactoryBot.define do
  factory :transcription do
    association :transcribable, factory: :media_response
    status { :not_requested }

    trait :pending do
      status { :pending }
    end

    trait :processing do
      status { :processing }
    end

    trait :completed do
      status { :completed }
    end

    trait :failed do
      status { :failed }
    end
  end
end
