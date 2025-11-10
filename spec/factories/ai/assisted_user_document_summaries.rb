# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_document_summary, class: 'AI::AssistedUserDocumentSummary' do
    association :user

    transient do
      document_attachment { nil }
    end

    assistable { document_attachment }
    assistable_type { 'ActiveStorage::Attachment' }

    trait :completed do
      status { :completed }
      checkpoint { 'This is a document summary' }
    end

    trait :in_progress do
      status { :in_progress }
    end

    trait :failed do
      status { :failed }
      error { 'Analysis failed' }
    end

    trait :with_chat do
      after(:create) do |session|
        create(:assistant_chat, ai_assisted_user_session: session)
      end
    end
  end
end
