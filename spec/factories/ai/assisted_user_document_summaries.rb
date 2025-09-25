# frozen_string_literal: true

FactoryBot.define do
  factory :assisted_user_document_summary, class: 'AI::AssistedUserDocumentSummary' do
    association :user
    association :ai_assistant_chat, factory: :assistant_chat

    transient do
      document_blob { nil }
    end

    assistable { document_blob }
    assistable_type { 'ActiveStorage::Blob' }

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
  end
end
