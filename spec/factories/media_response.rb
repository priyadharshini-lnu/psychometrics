# frozen_string_literal: true

FactoryBot.define do
  factory :media_response do
    question
    users_result

    transient do
      transcription_status { nil }
    end

    after(:create) do |media_response, evaluator|
      if evaluator.transcription_status.present?
        create(:transcription, transcribable: media_response, status: evaluator.transcription_status)
      end
    end
  end
end
