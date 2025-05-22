# frozen_string_literal: true

FactoryBot.define do
  factory :assistant, class: 'AI::Assistant' do
    sequence(:name) { |n| "Test Assistant #{n}" }
    description { 'This is a test assistant' }
    action { 'chat' }
    user_prompt { 'Ask me anything' }
    system_prompt { 'Be helpful and concise' }

    # Optional associations
    owner { nil }
    last_modified_by { nil }
  end
end
